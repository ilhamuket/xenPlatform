// src/xendit/xendit.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class XenditService {
  private base = 'https://api.xendit.co';

  constructor(private configService: ConfigService) {}

  private getHeaders(forUserId?: string) {
    const secretKey = this.configService.get('XENDIT_SECRET_KEY');
    const headers: Record<string, string> = {
      Authorization: 'Basic ' + Buffer.from(secretKey + ':').toString('base64'),
      'Content-Type': 'application/json',
    };

    if (forUserId) {
      headers['for-user-id'] = forUserId;
    }

    return headers;
  }

  // ===================== QRIS METHODS =====================

  /**
   * Create QRIS Code
   * @param amount - Amount in IDR
   * @param referenceId - Unique reference ID
   * @param channelCode - Channel code (ID_DANA, ID_LINKAJA, ID_OVO, ID_SHOPEEPAY)
   * @param forUserId - Sub-account user ID (optional)
   */
  async createQRIS(
    amount: number,
    referenceId: string,
    channelCode: string,
    forUserId?: string,
  ) {
    const url = `${this.base}/qr_codes`;

    // Set expiry 24 jam dari sekarang
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const body = {
      external_id: referenceId,
      reference_id: referenceId,
      callback_url: 'https://calling-back.com/xendit/qris', // Add callback URL
      type: 'DYNAMIC',
      currency: 'IDR',
      amount: amount,
      channel_code: channelCode,
      expires_at: expiresAt,
    };

    console.log('📤 Creating QRIS:', JSON.stringify(body, null, 2));

    try {
      const { data } = await axios.post(url, body, {
        headers: {
          ...this.getHeaders(forUserId),
          'api-version': '2022-07-31',
        },
      });

      console.log('✅ QRIS Created:', {
        id: data.id,
        reference_id: data.reference_id,
        channel_code: data.channel_code,
        qr_string_length: data.qr_string?.length,
        status: data.status,
      });

      return data;
    } catch (err: any) {
      console.error('❌ Xendit QRIS Error:', err.response?.data || err.message);
      throw err;
    }
  }

  /**
   * Simulate QRIS Payment (Test Mode Only)
   * @param qrId - QR Code ID from createQRIS response
   * @param amount - Amount to simulate
   * @param forUserId - Sub-account user ID (optional)
   */
  async simulateQRISPayment(qrId: string, amount: number, forUserId?: string) {
    const url = `${this.base}/qr_codes/${qrId}/payments/simulate`;

    const body = {
      amount: amount,
    };

    console.log('🎮 Simulating QRIS Payment:', {
      qr_id: qrId,
      amount: amount,
      url: url,
    });

    try {
      const { data } = await axios.post(url, body, {
        headers: {
          ...this.getHeaders(forUserId),
          'api-version': '2022-07-31',
        },
      });

      console.log('✅ QRIS Simulation Response:', data);
      return data;
    } catch (err: any) {
      console.error('❌ Xendit QRIS Simulation Error:', err.response?.data || err.message);
      throw err;
    }
  }
}