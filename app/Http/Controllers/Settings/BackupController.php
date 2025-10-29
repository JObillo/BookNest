<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

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
    // 💾 Create FULL DATABASE BACKUP
public function store(Request $request)
{
    try {
        date_default_timezone_set('Asia/Manila');
        $now = now('Asia/Manila');

        $activeSemester = \App\Models\Semester::whereNull('end_date')->first();
        $semesterName = $activeSemester ? str_replace(' ', '_', $activeSemester->name) : 'NoSemester';
        $timestamp = strtoupper($now->format('Y-m-d_h-ia'));

        $backupDir = storage_path('app/private/PhilCST');
        $backupName = "PhilCST_OPAC_Backup_{$semesterName}_{$timestamp}";
        $sqlFile = "{$backupDir}/{$backupName}.sql";
        $zipFile = "{$backupDir}/{$backupName}.zip";

        if (!file_exists($backupDir)) mkdir($backupDir, 0755, true);

        $db = config('database.connections.mysql');
        $mysqldump = 'C:/xampp/mysql/bin/mysqldump.exe';
        $dbName = $db['database'];

        $dumpCommand = "\"{$mysqldump}\" -h {$db['host']} -u {$db['username']}";
        if (!empty($db['password'])) $dumpCommand .= " -p{$db['password']}";
        $dumpCommand .= " {$dbName} > \"{$sqlFile}\"";

        $zipCommand = "powershell Compress-Archive -Path \"{$sqlFile}\" -DestinationPath \"{$zipFile}\" -Force";
        $cleanupCommand = "del \"{$sqlFile}\"";

        $bat = "@echo off\n".
                "cd /d \"" . base_path() . "\"\n".
                "{$dumpCommand}\n".
                "{$zipCommand}\n".
                "{$cleanupCommand}\n".
                "exit";

        $batFile = storage_path('app/run_backup.bat');
        file_put_contents($batFile, $bat);
        pclose(popen("start /B cmd /C \"{$batFile}\"", "r"));

        // 🕒 Wait until ZIP exists (max 10 seconds)
        $waited = 0;
        while (!file_exists($zipFile) && $waited < 10) {
            sleep(1);
            $waited++;
        }

        return response()->json([
            'success' => true,
            'message' => '✅ Backup completed successfully!',
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
//     public function restore($filename)
// {
//     try {
//         $backupDir = storage_path('app/private/PhilCST');
//         $zipPath = "{$backupDir}/{$filename}";
//         $restoreStatus = storage_path('app/restore_status.txt');
//         $mysql = 'C:/xampp/mysql/bin/mysql.exe';

//         // Initialize status
//         file_put_contents($restoreStatus, 'starting');

//         if (!file_exists($zipPath)) {
//             file_put_contents($restoreStatus, 'error: file not found');
//             return response()->json(['success' => false, 'message' => 'Backup file not found.'], 404);
//         }

//         // Create extraction folder
//         $extractDir = "{$backupDir}/restore_temp";
//         if (!file_exists($extractDir)) mkdir($extractDir, 0755, true);

//         // Unzip the backup
//         shell_exec("powershell Expand-Archive -Path \"{$zipPath}\" -DestinationPath \"{$extractDir}\" -Force");

//         // Find the SQL file
//         $sqlFile = glob("{$extractDir}/*.sql")[0] ?? null;
//         if (!$sqlFile) {
//             file_put_contents($restoreStatus, 'error: no sql found');
//             return response()->json(['success' => false, 'message' => 'SQL file not found in backup.'], 404);
//         }

//         // Database credentials
//         $db = config('database.connections.mysql');
//         $dbName = $db['database'];
//         $restoreCommand = "\"{$mysql}\" -h {$db['host']} -u {$db['username']}";

//         if (!empty($db['password'])) $restoreCommand .= " -p{$db['password']}";
//         $restoreCommand .= " {$dbName} < \"{$sqlFile}\"";

//         // Create a .bat file that updates status clearly
//         $bat = "@echo off\n" .
//             "echo running > \"{$restoreStatus}\"\n" .
//             "{$restoreCommand}\n" .
//             "echo done > \"{$restoreStatus}\"\n" .
//             "rmdir /s /q \"{$extractDir}\"\n" .
//             "exit";

//         $batFile = storage_path('app/run_restore.bat');
//         file_put_contents($batFile, $bat);

//         // Run the batch file in the background (async)
//         pclose(popen("start /B cmd /C \"{$batFile}\"", "r"));

//         return response()->json(['success' => true, 'message' => 'Restore started. Please wait...']);
//     } catch (\Exception $e) {
//         file_put_contents(storage_path('app/restore_status.txt'), 'error: ' . $e->getMessage());
//         return response()->json([
//             'success' => false,
//             'message' => '❌ Restore failed: ' . $e->getMessage(),
//         ], 500);
//     }
// }

public function restoreStatus()
{
    $statusFile = storage_path('app/restore_status.txt');

    if (!file_exists($statusFile)) {
        return response()->json(['status' => 'idle']);
    }

    $status = trim(file_get_contents($statusFile));

    // Sanitize text in case PowerShell writes extra spaces
    $status = strtolower(str_replace(["\r", "\n"], '', $status));

    // ✅ Make sure frontend always gets one of these
    if (str_contains($status, 'done')) $status = 'done';
    elseif (str_contains($status, 'error')) $status = 'error';
    elseif (str_contains($status, 'running') || str_contains($status, 'starting')) $status = 'running';

    return response()->json(['status' => $status]);
}
public function uploadRestore(Request $request)
{
    try {
        $request->validate([
            'password' => 'required|string',
            'file' => 'required|file|mimes:zip,sql|max:51200', // max 50MB
        ]);

        // ✅ Verify admin password
        $admin = Auth::user();
        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json(['success' => false, 'message' => '❌ Invalid admin password.'], 403);
        }

        // Save uploaded file
        $uploadedFile = $request->file('file');
        $backupDir = storage_path('app/private/PhilCST/uploads');
        if (!file_exists($backupDir)) mkdir($backupDir, 0755, true);

        $filePath = $backupDir . '/' . $uploadedFile->getClientOriginalName();
        $uploadedFile->move($backupDir, $uploadedFile->getClientOriginalName());

        // If it's a ZIP, extract it
        $extractDir = "{$backupDir}/restore_temp";
        if (!file_exists($extractDir)) mkdir($extractDir, 0755, true);

        $sqlFile = '';
        if (pathinfo($filePath, PATHINFO_EXTENSION) === 'zip') {
            shell_exec("powershell Expand-Archive -Path \"{$filePath}\" -DestinationPath \"{$extractDir}\" -Force");
            $sqlFile = glob("{$extractDir}/*.sql")[0] ?? null;
        } else {
            $sqlFile = $filePath;
        }

        if (!$sqlFile || !file_exists($sqlFile)) {
            return response()->json(['success' => false, 'message' => '❌ SQL file not found in backup.'], 404);
        }

        // Run restore command
        $db = config('database.connections.mysql');
        $mysql = 'C:/xampp/mysql/bin/mysql.exe';
        $restoreCommand = "\"{$mysql}\" -h {$db['host']} -u {$db['username']}";
        if (!empty($db['password'])) $restoreCommand .= " -p{$db['password']}";
        $restoreCommand .= " {$db['database']} < \"{$sqlFile}\"";

        $bat = "@echo off\n{$restoreCommand}\nexit";
        $batFile = storage_path('app/run_restore_upload.bat');
        file_put_contents($batFile, $bat);

        pclose(popen("start /B cmd /C \"{$batFile}\"", "r"));

        return response()->json(['success' => true, 'message' => '✅ Restore started successfully!']);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => '❌ Restore failed: ' . $e->getMessage(),
        ], 500);
    }
}


}
