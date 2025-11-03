<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class BackupController extends Controller
{
    // 📂 Show all existing backups
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

    // 💾 Create a full database + uploads backup
    public function store(Request $request)
    {
        try {
            date_default_timezone_set('Asia/Manila');
            $now = now('Asia/Manila');

            $activeSemester = \App\Models\Semester::orderBy('start_date', 'desc')->first();
            $semesterName = $activeSemester ? str_replace(' ', '_', $activeSemester->name) : 'NoSemester';
            $timestamp = strtoupper($now->format('Y-m-d_h-ia'));

            $backupDir = storage_path('app/private/PhilCST');
            if (!file_exists($backupDir)) mkdir($backupDir, 0755, true);

            $backupName = "PhilCST_OPAC_Backup_{$semesterName}_{$timestamp}";
            $sqlFile = "{$backupDir}/{$backupName}.sql";
            $zipFile = "{$backupDir}/{$backupName}.zip";

            $db = config('database.connections.mysql');
            $mysqldump = $this->detectExecutable('mysqldump');
            $dbName = $db['database'];

            $dumpCommand = "\"{$mysqldump}\" -h {$db['host']} -u {$db['username']}";
            if (!empty($db['password'])) $dumpCommand .= " -p{$db['password']}";
            $dumpCommand .= " {$dbName} > \"{$sqlFile}\"";

            // Backup uploads folder too
            $uploadsPath = storage_path('app/public/uploads');

            $zipCommand = "powershell Compress-Archive -Path \"{$sqlFile}\" -DestinationPath \"{$zipFile}\" -Force";
            if (file_exists($uploadsPath)) {
                $zipCommand .= " ; powershell Compress-Archive -Path \"{$uploadsPath}\" -Update -DestinationPath \"{$zipFile}\"";
            }

            $cleanupCommand = "del \"{$sqlFile}\"";

            $bat = "@echo off\n" .
                "cd /d \"" . base_path() . "\"\n" .
                "{$dumpCommand}\n" .
                "{$zipCommand}\n" .
                "{$cleanupCommand}\n" .
                "exit";

            $batFile = storage_path('app/run_backup.bat');
            file_put_contents($batFile, $bat);
            pclose(popen("start /B cmd /C \"{$batFile}\"", "r"));

            // Wait for zip creation
            $waited = 0;
            while (!file_exists($zipFile) && $waited < 15) {
                sleep(1);
                $waited++;
            }

            return response()->json([
                'success' => true,
                'message' => 'Backup (DB + Covers) completed successfully!',
                'file' => basename($zipFile),
            ]);
        } catch (\Exception $e) {
            Log::error('Backup failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Backup failed: ' . $e->getMessage(),
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

    // ♻️ Restore progress polling
    public function restoreStatus()
    {
        $statusFile = storage_path('app/restore_status.txt');

        if (!file_exists($statusFile)) {
            return response()->json(['status' => 'idle']);
        }

        $status = strtolower(trim(file_get_contents($statusFile)));
        $status = str_replace(["\r", "\n"], '', $status);

        if (str_contains($status, 'done')) $status = 'done';
        elseif (str_contains($status, 'error')) $status = 'error';
        elseif (str_contains($status, 'running') || str_contains($status, 'starting')) $status = 'running';

        return response()->json(['status' => $status]);
    }

    // 🔄 Upload and restore (DB + uploaded images)
    public function uploadRestore(Request $request)
    {
        try {
            $request->validate([
                'password' => 'required|string',
                'file' => 'required|file',
            ]);

            $admin = Auth::user();
            if (!$admin || !Hash::check($request->password, $admin->password)) {
                return response()->json(['success' => false, 'message' => '❌ Invalid admin password.'], 403);
            }

            $backupDir = storage_path('app/private/PhilCST');
            $uploadDir = "{$backupDir}/uploads";
            $extractDir = "{$backupDir}/restore_temp";
            $statusFile = storage_path('app/restore_status.txt');

            if (!file_exists($uploadDir)) mkdir($uploadDir, 0755, true);
            if (!file_exists($extractDir)) mkdir($extractDir, 0755, true);

            $uploadedFile = $request->file('file');
            $filePath = "{$uploadDir}/" . $uploadedFile->getClientOriginalName();
            $uploadedFile->move($uploadDir, $uploadedFile->getClientOriginalName());

            file_put_contents($statusFile, 'starting');

            $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
            $sqlFile = null;

            // 🗜️ Extract ZIP backup and find SQL
if ($ext === 'zip') {
    // 1️⃣ Extract using PowerShell (works on Windows)
    shell_exec("powershell -Command \"Expand-Archive -Path '{$filePath}' -DestinationPath '{$extractDir}' -Force\"");

    // 2️⃣ Wait until extraction finishes
    $waited = 0;
    while (!glob($extractDir . '/*.sql') && $waited < 10) {
        sleep(1);
        $waited++;
    }

    // 3️⃣ Restore uploads folder if found
    $uploadsRestored = $extractDir . '/uploads';
    $targetUploads = storage_path('app/public/uploads');
    if (file_exists($uploadsRestored)) {
        @mkdir($targetUploads, 0755, true);
        shell_exec("xcopy /E /Y \"{$uploadsRestored}\" \"{$targetUploads}\" >nul");
    }

    // 4️⃣ Locate SQL file in extracted folder
    $iterator = new \RecursiveIteratorIterator(
        new \RecursiveDirectoryIterator($extractDir, \FilesystemIterator::SKIP_DOTS)
    );
    foreach ($iterator as $file) {
        if (strtolower(pathinfo($file, PATHINFO_EXTENSION)) === 'sql') {
            $sqlFile = $file->getPathname();
            break;
        }
    }
}
 elseif ($ext === 'sql') {
                $sqlFile = $filePath;
            }

            if (!$sqlFile || !file_exists($sqlFile)) {
                file_put_contents($statusFile, 'error: no sql file found');
                return response()->json(['success' => false, 'message' => '❌ SQL file not found.'], 404);
            }

            $db = config('database.connections.mysql');
            $mysql = $this->detectExecutable('mysql');
            $restoreCommand = "\"{$mysql}\" -h {$db['host']} -u {$db['username']}";
            if (!empty($db['password'])) $restoreCommand .= " -p{$db['password']}";
            $restoreCommand .= " {$db['database']} < \"{$sqlFile}\"";

            $bat = "@echo off\n" .
                "echo running > \"{$statusFile}\"\n" .
                "{$restoreCommand}\n" .
                "echo done > \"{$statusFile}\"\n" .
                "rmdir /s /q \"{$extractDir}\" >nul 2>&1\n" .
                "exit";

            $batFile = storage_path('app/run_restore_upload.bat');
            file_put_contents($batFile, $bat);
            pclose(popen("start /B cmd /C \"{$batFile}\"", "r"));

            return response()->json(['success' => true, 'message' => '✅ Restore (DB + Covers) started successfully!']);
        } catch (\Exception $e) {
            file_put_contents(storage_path('app/restore_status.txt'), 'error: ' . $e->getMessage());
            Log::error('Restore failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => '❌ Restore failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    // 🔍 Detect MySQL executables automatically
    private function detectExecutable(string $exeName): string
    {
        $paths = [
            "C:/xampp/mysql/bin/{$exeName}.exe",
            "D:/xampp/mysql/bin/{$exeName}.exe",
            "C:/Program Files/MySQL/MySQL Server 8.0/bin/{$exeName}.exe",
            "C:/Program Files (x86)/MySQL/MySQL Server 5.7/bin/{$exeName}.exe",
        ];

        foreach ($paths as $path) {
            if (file_exists($path)) return $path;
        }

        return $exeName;
    }
}

//backupcontoller