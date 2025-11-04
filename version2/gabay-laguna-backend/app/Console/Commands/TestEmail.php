<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class TestEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:test {email? : The email address to send test email to}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test email configuration by sending a test email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email') ?? config('mail.from.address');
        
        if (!$email) {
            $this->error('No email address provided and MAIL_FROM_ADDRESS is not set');
            return 1;
        }

        $this->info("Testing email configuration...");
        $this->info("Mail Driver: " . config('mail.default'));
        $this->info("Mail Host: " . config('mail.mailers.smtp.host'));
        $this->info("Mail Port: " . config('mail.mailers.smtp.port'));
        $this->info("Mail From: " . config('mail.from.address'));
        $this->info("Sending test email to: {$email}");

        try {
            Mail::send('emails.test', ['testMessage' => 'This is a test email from Gabay Laguna'], function ($message) use ($email) {
                $message->to($email)
                        ->subject('Test Email - Gabay Laguna')
                        ->from(config('mail.from.address'), config('mail.from.name'));
            });

            $this->info("✓ Email sent successfully!");
            $this->info("Check your inbox and spam folder for the test email.");
            
            if (config('mail.default') === 'log') {
                $this->warn("⚠ Mail driver is set to 'log'. Email was logged, not sent.");
                $this->info("Check storage/logs/laravel.log to see the logged email.");
            }

            return 0;
        } catch (\Exception $e) {
            $this->error("✗ Email sending failed!");
            $this->error("Error: " . $e->getMessage());
            Log::error('Test email failed', [
                'email' => $email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $this->info("Check storage/logs/laravel.log for more details.");
            
            return 1;
        }
    }
}
