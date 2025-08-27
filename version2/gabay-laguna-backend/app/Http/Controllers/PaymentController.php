<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Process PayPal payment
     */
    public function processPayPalPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'booking_id' => 'required|exists:bookings,id',
            'paypal_payment_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $booking = Booking::where('tourist_id', auth()->id())->findOrFail($request->booking_id);

        if ($booking->status !== 'pending') {
            return response()->json([
                'message' => 'Invalid booking status for payment'
            ], 422);
        }

        // Create payment record
        $payment = Payment::create([
            'booking_id' => $booking->id,
            'payment_method' => 'paypal',
            'transaction_id' => $request->paypal_payment_id,
            'amount' => $booking->total_amount,
            'status' => 'pending',
            'payment_details' => [
                'paypal_payment_id' => $request->paypal_payment_id,
                'method' => 'paypal',
            ],
        ]);

        // Here you would integrate with PayPal API to verify and process the payment
        // For now, we'll simulate a successful payment
        $payment->update([
            'status' => 'completed',
            'paid_at' => now(),
        ]);

        $booking->update(['status' => 'confirmed']);

        return response()->json([
            'message' => 'Payment processed successfully',
            'payment' => $payment,
            'booking' => $booking->load(['tourGuide.user', 'pointOfInterest'])
        ]);
    }

    /**
     * Process PayMongo payment
     */
    public function processPayMongoPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'booking_id' => 'required|exists:bookings,id',
            'paymongo_payment_intent_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $booking = Booking::where('tourist_id', auth()->id())->findOrFail($request->booking_id);

        if ($booking->status !== 'pending') {
            return response()->json([
                'message' => 'Invalid booking status for payment'
            ], 422);
        }

        // Create payment record
        $payment = Payment::create([
            'booking_id' => $booking->id,
            'payment_method' => 'paymongo',
            'transaction_id' => $request->paymongo_payment_intent_id,
            'amount' => $booking->total_amount,
            'status' => 'pending',
            'payment_details' => [
                'paymongo_payment_intent_id' => $request->paymongo_payment_intent_id,
                'method' => 'paymongo',
            ],
        ]);

        // Here you would integrate with PayMongo API to verify and process the payment
        // For now, we'll simulate a successful payment
        $payment->update([
            'status' => 'completed',
            'paid_at' => now(),
        ]);

        $booking->update(['status' => 'confirmed']);

        return response()->json([
            'message' => 'Payment processed successfully',
            'payment' => $payment,
            'booking' => $booking->load(['tourGuide.user', 'pointOfInterest'])
        ]);
    }

    /**
     * PayPal webhook handler
     */
    public function paypalWebhook(Request $request)
    {
        Log::info('PayPal webhook received', $request->all());

        // Verify webhook signature
        // Process webhook data
        // Update payment status accordingly

        return response()->json(['status' => 'success']);
    }

    /**
     * PayMongo webhook handler
     */
    public function paymongoWebhook(Request $request)
    {
        Log::info('PayMongo webhook received', $request->all());

        // Verify webhook signature
        // Process webhook data
        // Update payment status accordingly

        return response()->json(['status' => 'success']);
    }

    /**
     * Get payment details
     */
    public function show(string $id)
    {
        $payment = Payment::with('booking.tourGuide.user')->findOrFail($id);

        // Check if user owns this payment or is the tour guide
        if ($payment->booking->tourist_id !== auth()->id() && 
            $payment->booking->tour_guide_id !== auth()->user()->tourGuide?->id) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'payment' => $payment
        ]);
    }

    /**
     * Refund payment
     */
    public function refund(Request $request, string $id)
    {
        $payment = Payment::with('booking')->findOrFail($id);

        if ($payment->booking->tourist_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        if ($payment->status !== 'completed') {
            return response()->json([
                'message' => 'Payment cannot be refunded'
            ], 422);
        }

        // Here you would integrate with the payment provider's API to process the refund
        $payment->update(['status' => 'refunded']);

        return response()->json([
            'message' => 'Refund processed successfully',
            'payment' => $payment
        ]);
    }
}
