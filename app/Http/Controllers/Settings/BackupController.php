<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BackupController extends Controller
{
    // 📂 Show all existing backups (unsorted)
    public function index()
    {
        $backupPath = storage_path('app/private/PhilCST');

        if (!file_exists($backupPath)) {
            return response()->json([]);
        }

        $files = collect(glob($backupPath . '/*.zip'))->map(function ($file) {
            return [
                'filename' => basename($file),
                'created_at' => date('Y-m-d H:i:s', filemtime($file)),
                'size_kb' => round(filesize($file) / 1024, 2),
            ];
        })->values();

        return response()->json($files);
    }

    // 💾 Create FULL DATABASE BACKUP
    public function store(Request $request)
{
    try {
        // 🔍 Get active semester (if any)
        $activeSemester = \App\Models\Semester::whereNull('end_date')->first();
        $semesterName = $activeSemester ? str_replace(' ', '_', $activeSemester->name) : 'NoSemester';

        // 🕒 Human-readable timestamp (e.g. 2025-10-26_04-05PM)
        $timestamp = now()->format('Y-m-d_h-ia'); // lowercase a = am/pm
        $timestamp = strtoupper($timestamp); // make AM/PM uppercase

        // 📂 File and directory setup
        $backupDir = storage_path('app/private/PhilCST');
        $backupName = "PhilCST_OPAC_Backup_{$semesterName}_{$timestamp}";
        $sqlFile = "{$backupDir}/{$backupName}.sql";
        $zipFile = "{$backupDir}/{$backupName}.zip";

        if (!file_exists($backupDir)) {
            mkdir($backupDir, 0755, true);
        }

        // 🗄️ Database info
        $db = config('database.connections.mysql');
        $dbName = $db['database'] ?? 'book_v2';
        $mysqldump = 'C:/xampp/mysql/bin/mysqldump.exe';

        // 📦 Dump command
        $dumpCommand = "\"{$mysqldump}\" -h {$db['host']} -u {$db['username']}";
        if (!empty($db['password'])) {
            $dumpCommand .= " -p{$db['password']}";
        }
        $dumpCommand .= " {$dbName} > \"{$sqlFile}\"";

        // 🗜️ Compress and clean
        $zipCommand = "powershell Compress-Archive -Path \"{$sqlFile}\" -DestinationPath \"{$zipFile}\" -Force";
        $cleanupCommand = "del \"{$sqlFile}\"";

        // 🧾 Batch file
        $bat = "@echo off\n{$dumpCommand}\n{$zipCommand}\n{$cleanupCommand}\nexit";
        $batFile = storage_path('app/run_backup.bat');
        file_put_contents($batFile, $bat);

        // 🚀 Run silently
        pclose(popen("start /B \"\" \"{$batFile}\"", "r"));

        return response()->json([
            'success' => true,
            'message' => '⏳ Backup started — please wait a few seconds.',
            'file' => basename($zipFile),
        ]);
    } catch (\Exception $e) {
        Log::error('Backup failed', ['error' => $e->getMessage()]);
        return response()->json([
            'success' => false,
            'message' => '❌ Backup failed: ' . $e->getMessage(),
        ], 500);
    }
}


    // 📥 Download backup
    public function download($filename)
    {
        $filePath = storage_path("app/private/PhilCST/{$filename}");

        if (!file_exists($filePath)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        return response()->download($filePath);
    }

    // ♻️ Restore selected backup
    public function restore($filename)
    {
        try {
            $backupDir = storage_path('app/private/PhilCST');
            $zipPath = "{$backupDir}/{$filename}";
            $restoreStatus = storage_path('app/restore_status.txt');
            $mysql = 'C:/xampp/mysql/bin/mysql.exe';

            if (!file_exists($zipPath)) {
                return response()->json(['success' => false, 'message' => 'Backup file not found.'], 404);
            }

            // ✅ Extract zip
            $extractDir = "{$backupDir}/restore_temp";
            if (!file_exists($extractDir)) {
                mkdir($extractDir, 0755, true);
            }

            $extractCommand = "powershell Expand-Archive -Path \"{$zipPath}\" -DestinationPath \"{$extractDir}\" -Force";
            shell_exec($extractCommand);

            // ✅ Find extracted .sql file
            $sqlFile = glob("{$extractDir}/*.sql")[0] ?? null;
            if (!$sqlFile) {
                return response()->json(['success' => false, 'message' => 'SQL file not found in backup.'], 404);
            }

            // ✅ Database connection
            $db = config('database.connections.mysql');
            $dbName = $db['database'] ?? 'book_v2';

            // ✅ Restore command
            $restoreCommand = "\"{$mysql}\" -h {$db['host']} -u {$db['username']}";
            if (!empty($db['password'])) {
                $restoreCommand .= " -p{$db['password']}";
            }
            $restoreCommand .= " {$dbName} < \"{$sqlFile}\"";

            // ✅ Batch restore script
            $bat = "@echo off\n" .
                "echo running > \"{$restoreStatus}\"\n" .
                "{$restoreCommand}\n" .
                "echo done > \"{$restoreStatus}\"\n" .
                "rmdir /s /q \"{$extractDir}\"\nexit";

            $batFile = storage_path('app/run_restore.bat');
            file_put_contents($batFile, $bat);

            // ✅ Run silently
            pclose(popen("start /B \"\" \"{$batFile}\"", "r"));

            return response()->json([
                'success' => true,
                'message' => '⏳ Restore started — wait a few seconds and check status.'
            ]);
        } catch (\Exception $e) {
            file_put_contents(storage_path('app/restore_status.txt'), 'error');
            return response()->json([
                'success' => false,
                'message' => '❌ Restore failed: ' . $e->getMessage()
            ], 500);
        }
    }

    // ✅ Check restore progress
    public function restoreStatus()
    {
        $statusFile = storage_path('app/restore_status.txt');
        $status = file_exists($statusFile) ? trim(file_get_contents($statusFile)) : 'idle';
        return response()->json(['status' => $status]);
    }
}
