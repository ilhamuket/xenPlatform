// src/transactions/transactions.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { XenditService } from '../xendit/xendit.service';
import { CompaniesService } from '../companies/companies.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class TransactionsService {
  // In-memory storage untuk mapping qrId -> forUserId
  // Dalam production, ini harus di database
  private qrMappings = new Map<string, { forUserId: string; amount: number; productId: number }>();

  constructor(
    private xendit: XenditService,
    private companies: CompaniesService,
    private products: ProductsService,
  ) {}

  /**
   * Create QRIS Payment
   * @param productId - Product ID
   * @param customerName - Customer name
   * @param customerEmail - Customer email
   * @param channelCode - QRIS channel (ID_DANA, ID_LINKAJA, ID_OVO, ID_SHOPEEPAY)
   */
  async createQRISPayment(
    productId: number,
    customerName: string,
    customerEmail: string,
    channelCode: string,
  ) {
    // Find product
    const product = this.products.findOne(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Find company
    const company = this.companies.findOne(product.companyId);
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Generate unique reference ID
    const referenceId = `qris-${Date.now()}-${productId}`;

    console.log('🛒 Creating QRIS for:', {
      product: product.name,
      company: company.name,
      forUserId: company.forUserId,
      amount: product.price,
      channelCode,
    });

    // Create QRIS via Xendit
    const qr = await this.xendit.createQRIS(
      product.price,
      referenceId,
      channelCode,
      company.forUserId, // 👈 Sub-account ID
    );

    // Store mapping untuk simulate payment nanti
    this.qrMappings.set(qr.id, {
      forUserId: company.forUserId,
      amount: product.price,
      productId: productId,
    });

    console.log('💾 Stored QR mapping:', {
      qrId: qr.id,
      forUserId: company.forUserId,
    });

    return {
      qr_id: qr.id,
      reference_id: qr.reference_id,
      external_id: qr.external_id,
      qr_string: qr.qr_string,
      channel_code: qr.channel_code,
      amount: qr.amount,
      currency: qr.currency,
      expires_at: qr.expires_at,
      status: qr.status,
      created: qr.created,
      // Additional info
      product_name: product.name,
      company_name: company.name,
      customer_name: customerName,
      customer_email: customerEmail,
    };
  }

  /**
   * Simulate QRIS Payment (Test Mode Only)
   * @param qrId - QR Code ID
   * @param amount - Amount to simulate
   * @param forUserId - Sub-account user ID (REQUIRED for sub-account QR codes)
   */
  async simulateQRISPayment(qrId: string, amount: number, forUserId?: string) {
    console.log('🎮 Simulating QRIS payment:', { qrId, amount, forUserId });

    // Jika forUserId tidak di-pass, coba ambil dari stored mapping
    let actualForUserId = forUserId;
    
    if (!actualForUserId) {
      const mapping = this.qrMappings.get(qrId);
      if (mapping) {
        actualForUserId = mapping.forUserId;
        console.log('📦 Found stored mapping:', {
          qrId,
          forUserId: actualForUserId,
        });
      } else {
        console.log('⚠️ No mapping found for qrId:', qrId);
      }
    }

    const result = await this.xendit.simulateQRISPayment(qrId, amount, actualForUserId);

    return {
      success: true,
      message: 'QRIS payment simulated successfully',
      data: result,
    };
  }
}