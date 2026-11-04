import { supabase } from './supabase';
import { Product } from '../types/inventory';
import { Order, OrderItem, OrderStatus } from '../types/order';
import { Sale, SaleItem } from '../types/sale';
import { PaymentMethod, PaymentStatus } from '../types/sale';
import {
  Booking,
  BookingItem,
  BookingStatus,
  LorryLoadingSheet,
  LorryLoadingSheetItem,
  DeliveryRecord,
  BillEditApprovalRequest,
} from '../types/sfa';

// ─────────────────────────────────────────────────────────
// Product Services
// ─────────────────────────────────────────────────────────
export const productService = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapProduct);
  },

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) return null;
    return data ? mapProduct(data) : null;
  },

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({ name: product.name, code: product.sku, category: product.category, price: product.price })
      .select().single();
    if (error) throw error;
    return mapProduct(data);
  },

  async update(id: string, product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product> {
    const patch: Record<string, unknown> = {};
    if (product.name)        patch.name     = product.name;
    if (product.category)    patch.category = product.category;
    if (product.price != null) patch.price  = product.price;
    const { data, error } = await supabase.from('products').update(patch).eq('id', id).select().single();
    if (error) throw error;
    return mapProduct(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },
};

function mapProduct(p: Record<string, unknown>): Product {
  return {
    id:          p.id as string,
    name:        p.name as string,
    description: '',
    sku:         (p.code as string) ?? '',
    price:       p.price as number,
    category:    (p.category as string) ?? 'Uncategorized',
    createdAt:   new Date(p.created_at as string),
    updatedAt:   new Date(p.created_at as string),
  };
}

// ─────────────────────────────────────────────────────────
// Order Services (Agency → Company orders)
// Bug fix: 'companies' table → 'agencies' table
// ─────────────────────────────────────────────────────────
export const orderService = {
  async getAll(): Promise<Order[]> {
    const { data: orders, error: ordersError } = await supabase
      .from('draft_invoices').select('*').order('created_at', { ascending: false });
    if (ordersError) throw ordersError;
    if (!orders?.length) return [];

    const orderIds = orders.map(o => o.id);
    const { data: items, error: itemsError } = await supabase
      .from('draft_invoice_items').select('*').in('order_id', orderIds);
    if (itemsError) throw itemsError;

    // Bug fix: 'companies' → 'agencies'
    const agencyIds = [...new Set(orders.map(o => o.company_id))];
    const { data: agencies } = await supabase
      .from('agencies').select('id, name, code').in('id', agencyIds);
    const agencyMap = new Map((agencies ?? []).map(a => [a.id, { name: a.name, code: a.code ?? '' }]));

    return orders.map(order => ({
      id:          order.id,
      companyId:   order.company_id,
      agencyName:  agencyMap.get(order.company_id)?.name ?? 'Unknown Agency',
      agencyCode:  agencyMap.get(order.company_id)?.code ?? '',
      draftDate:   order.draft_date,
      status:      order.status as OrderStatus,
      totalAmount: order.total_amount,
      notes:       order.notes ?? undefined,
      createdBy:   order.created_by,
      createdAt:   order.created_at,
      updatedAt:   order.updated_at,
      items: (items ?? []).filter(i => i.order_id === order.id).map(mapOrderItem),
    }));
  },

  async create(order: { companyId: string; draftDate: string; totalAmount: number; items: Omit<OrderItem, 'id' | 'orderId'>[]; notes?: string; createdBy: string }): Promise<Order> {
    const { data: orderData, error: orderError } = await supabase
      .from('draft_invoices')
      .insert({ company_id: order.companyId, draft_date: order.draftDate, status: OrderStatus.PENDING, total_amount: order.totalAmount, notes: order.notes ?? null, created_by: order.createdBy })
      .select().single();
    if (orderError) throw orderError;

    const orderItems = order.items.map(item => ({ order_id: orderData.id, inventory_id: item.inventoryId, quantity: item.quantity, price: item.price, discount: item.discount ?? 0, is_free: item.isFree ?? 0, total_amount: item.totalAmount }));
    const { error: itemsError } = await supabase.from('draft_invoice_items').insert(orderItems);
    if (itemsError) {
      await supabase.from('draft_invoices').delete().eq('id', orderData.id);
      throw itemsError;
    }

    // Bug fix: 'companies' → 'agencies'
    const { data: agency } = await supabase.from('agencies').select('name, code').eq('id', order.companyId).single();
    const { data: items } = await supabase.from('draft_invoice_items').select('*').eq('order_id', orderData.id);

    return {
      id:          orderData.id,
      companyId:   orderData.company_id,
      agencyName:  agency?.name ?? 'Unknown Agency',
      agencyCode:  agency?.code ?? '',
      draftDate:   orderData.draft_date,
      status:      orderData.status as OrderStatus,
      totalAmount: orderData.total_amount,
      notes:       orderData.notes ?? undefined,
      createdBy:   orderData.created_by,
      createdAt:   orderData.created_at,
      updatedAt:   orderData.updated_at,
      items:       (items ?? []).map(mapOrderItem),
    };
  },

  async updateStatus(orderId: string, status: OrderStatus): Promise<void> {
    const { error } = await supabase.from('draft_invoices').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
    if (error) throw error;
  },
};

function mapOrderItem(item: Record<string, unknown>): OrderItem {
  return {
    id:          item.id as string,
    orderId:     item.order_id as string,
    inventoryId: item.inventory_id as string,
    quantity:    item.quantity as number,
    price:       item.price as number,
    discount:    (item.discount as number) ?? 0,
    isFree:      (item.is_free as number) ?? 0,
    totalAmount: item.total_amount as number,
  };
}

// ─────────────────────────────────────────────────────────
// Invoice / Sales Services
// ─────────────────────────────────────────────────────────
export const invoiceService = {
  async getAll(): Promise<Sale[]> {
    const { data: invoices, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    if (!invoices?.length) return [];

    const ids = invoices.map(i => i.id);
    const { data: items, error: itemsError } = await supabase.from('invoice_items').select('*').in('invoice_id', ids);
    if (itemsError) throw itemsError;

    return invoices.map(inv => ({
      id:            inv.id,
      invoiceNumber: inv.invoice_no,
      customerId:    inv.customer_id,
      salesRepId:    inv.sales_rep_id,
      companyId:     inv.company_id,
      invoiceDate:   inv.date,
      totalAmount:   inv.total_amount,
      discount:      inv.discount ?? 0,
      tax:           inv.tax ?? 0,
      netAmount:     inv.net_amount,
      paymentMethod: inv.payment_method as PaymentMethod,
      paymentStatus: inv.payment_status as PaymentStatus,
      createdAt:     new Date(inv.created_at),
      updatedAt:     new Date(inv.updated_at),
      items: (items ?? []).filter(i => i.invoice_id === inv.id).map(item => ({
        id:          item.id,
        saleId:      item.invoice_id,
        inventoryId: item.inventory_id,
        quantity:    item.quantity,
        price:       item.price,
        discount:    item.discount ?? 0,
        isFree:      item.is_free ?? 0,
        totalAmount: item.total_amount,
      } as SaleItem)),
    }));
  },

  async create(invoice: {
    invoiceNumber: string; customerId: string; salesRepId: string; companyId: string;
    invoiceDate: string; totalAmount: number; discount: number; tax: number; netAmount: number;
    paymentMethod: PaymentMethod; paymentStatus: PaymentStatus;
    items: Omit<SaleItem, 'id' | 'saleId'>[];
  }): Promise<Sale> {
    const { data: inv, error } = await supabase.from('invoices')
      .insert({ invoice_no: invoice.invoiceNumber, customer_id: invoice.customerId, sales_rep_id: invoice.salesRepId, company_id: invoice.companyId, date: invoice.invoiceDate, total_amount: invoice.totalAmount, discount: invoice.discount, tax: invoice.tax, net_amount: invoice.netAmount, payment_method: invoice.paymentMethod, payment_status: invoice.paymentStatus })
      .select().single();
    if (error) throw error;

    const invItems = invoice.items.map(item => ({ invoice_id: inv.id, inventory_id: item.inventoryId, quantity: item.quantity, price: item.price, discount: item.discount ?? 0, is_free: item.isFree ?? 0, total_amount: item.totalAmount }));
    const { error: itemsError } = await supabase.from('invoice_items').insert(invItems);
    if (itemsError) {
      await supabase.from('invoices').delete().eq('id', inv.id);
      throw itemsError;
    }

    const { data: items } = await supabase.from('invoice_items').select('*').eq('invoice_id', inv.id);
    return {
      id: inv.id, invoiceNumber: inv.invoice_no, customerId: inv.customer_id,
      salesRepId: inv.sales_rep_id, companyId: inv.company_id, invoiceDate: inv.date,
      totalAmount: inv.total_amount, discount: inv.discount ?? 0, tax: inv.tax ?? 0,
      netAmount: inv.net_amount, paymentMethod: inv.payment_method as PaymentMethod,
      paymentStatus: inv.payment_status as PaymentStatus,
      createdAt: new Date(inv.created_at), updatedAt: new Date(inv.updated_at),
      items: (items ?? []).map(item => ({ id: item.id, saleId: item.invoice_id, inventoryId: item.inventory_id, quantity: item.quantity, price: item.price, discount: item.discount ?? 0, isFree: item.is_free ?? 0, totalAmount: item.total_amount } as SaleItem)),
    };
  },
};

// ─────────────────────────────────────────────────────────
// Booking Services (Mode 1 — Rep pre-sell)
// ─────────────────────────────────────────────────────────
export const bookingService = {
  async getByAgency(agencyId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings').select('*, booking_items(*)').eq('agency_id', agencyId)
      .order('booking_date', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapBooking);
  },

  async getByRep(salesRepId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings').select('*, booking_items(*), shops(name)').eq('sales_rep_id', salesRepId)
      .order('booking_date', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapBooking);
  },

  async create(booking: Omit<Booking, 'id' | 'bookingNumber' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    const bookingNumber = `BK-${Date.now()}`;
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        booking_number:    bookingNumber,
        agency_id:         booking.agencyId,
        sales_rep_id:      booking.salesRepId,
        shop_id:           booking.shopId,
        booking_date:      booking.bookingDate,
        expected_delivery: booking.expectedDelivery ?? null,
        gps_latitude:      booking.gpsLocation?.latitude ?? null,
        gps_longitude:     booking.gpsLocation?.longitude ?? null,
        gps_address:       booking.gpsLocation?.address ?? null,
        subtotal:          booking.subtotal,
        discount:          booking.discount,
        total_amount:      booking.totalAmount,
        notes:             booking.notes ?? null,
        status:            'PENDING',
      })
      .select().single();
    if (error) throw error;

    const items = booking.items.map(item => ({
      booking_id:   data.id,
      inventory_id: item.inventoryId,
      product_name: item.productName,
      product_code: item.productCode,
      quantity:     item.quantity,
      unit_price:   item.unitPrice,
      discount:     item.discount,
      total_amount: item.totalAmount,
      is_free:      item.isFree,
      free_reason:  item.freeReason ?? null,
    }));
    const { error: itemsError } = await supabase.from('booking_items').insert(items);
    if (itemsError) {
      await supabase.from('bookings').delete().eq('id', data.id);
      throw itemsError;
    }

    const { data: full } = await supabase.from('bookings').select('*, booking_items(*)').eq('id', data.id).single();
    return mapBooking(full!);
  },

  async updateStatus(bookingId: string, status: BookingStatus): Promise<void> {
    const { error } = await supabase.from('bookings').update({ status, updated_at: new Date().toISOString() }).eq('id', bookingId);
    if (error) throw error;
  },
};

function mapBooking(b: Record<string, unknown>): Booking {
  const items = (b.booking_items as Record<string, unknown>[] ?? []).map(item => ({
    id:           item.id as string,
    inventoryId:  item.inventory_id as string,
    productName:  item.product_name as string,
    productCode:  item.product_code as string,
    quantity:     item.quantity as number,
    unitPrice:    item.unit_price as number,
    discount:     item.discount as number,
    totalAmount:  item.total_amount as number,
    isFree:       item.is_free as boolean,
    freeReason:   item.free_reason as string | undefined,
  } as BookingItem));

  return {
    id:               b.id as string,
    bookingNumber:    b.booking_number as string,
    agencyId:         b.agency_id as string,
    salesRepId:       b.sales_rep_id as string,
    shopId:           b.shop_id as string,
    shopName:         (b.shops as Record<string, unknown>)?.name as string ?? '',
    bookingDate:      b.booking_date as string,
    expectedDelivery: b.expected_delivery as string | undefined,
    gpsLocation:      b.gps_latitude ? { latitude: b.gps_latitude as number, longitude: b.gps_longitude as number, address: b.gps_address as string } : undefined,
    items,
    subtotal:     b.subtotal as number,
    discount:     b.discount as number,
    totalAmount:  b.total_amount as number,
    notes:        b.notes as string | undefined,
    status:       b.status as BookingStatus,
    createdAt:    b.created_at as string,
    updatedAt:    b.updated_at as string,
  };
}

// ─────────────────────────────────────────────────────────
// Lorry Loading Sheet Services
// ─────────────────────────────────────────────────────────
export const loadingSheetService = {
  /** Bookings eka aggregate kara loading sheet eka generate karanawa */
  async generate(agencyId: string, bookingIds: string[], meta: { vehicleId?: string; driverId?: string; collectorId?: string; route?: string; createdBy: string }): Promise<LorryLoadingSheet> {
    // Booking items aggregate karala product-wise totals hadanawa
    const { data: bookingItems, error } = await supabase
      .from('booking_items').select('*').in('booking_id', bookingIds);
    if (error) throw error;

    const aggregated = new Map<string, LorryLoadingSheetItem>();
    for (const item of bookingItems ?? []) {
      const key = item.inventory_id as string;
      if (aggregated.has(key)) {
        aggregated.get(key)!.totalQty += item.quantity as number;
      } else {
        aggregated.set(key, {
          inventoryId:  key,
          productName:  item.product_name as string,
          productCode:  item.product_code as string,
          totalQty:     item.quantity as number,
          unitPrice:    item.unit_price as number,
        });
      }
    }

    const sheetNumber = `LLS-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    const { data: sheet, error: sheetError } = await supabase
      .from('lorry_loading_sheets')
      .insert({ sheet_number: sheetNumber, agency_id: agencyId, vehicle_id: meta.vehicleId ?? null, driver_id: meta.driverId ?? null, collector_id: meta.collectorId ?? null, route: meta.route ?? null, loading_date: today, status: 'GENERATED', created_by: meta.createdBy })
      .select().single();
    if (sheetError) throw sheetError;

    // Booking links
    const links = bookingIds.map(bid => ({ sheet_id: sheet.id, booking_id: bid }));
    await supabase.from('loading_sheet_bookings').insert(links);

    // Aggregate items
    const sheetItems = [...aggregated.values()].map(i => ({ sheet_id: sheet.id, inventory_id: i.inventoryId, product_name: i.productName, product_code: i.productCode, total_qty: i.totalQty, unit_price: i.unitPrice }));
    await supabase.from('loading_sheet_items').insert(sheetItems);

    // Bookings status update — LOADED_TO_LORRY
    await supabase.from('bookings').update({ status: 'LOADED_TO_LORRY', updated_at: new Date().toISOString() }).in('id', bookingIds);

    return {
      id:          sheet.id,
      sheetNumber: sheet.sheet_number,
      agencyId:    sheet.agency_id,
      vehicleId:   sheet.vehicle_id ?? undefined,
      driverId:    sheet.driver_id ?? undefined,
      collectorId: sheet.collector_id ?? undefined,
      route:       sheet.route ?? undefined,
      loadingDate: sheet.loading_date,
      bookingIds,
      items:       [...aggregated.values()],
      status:      sheet.status,
      notes:       sheet.notes ?? undefined,
      createdBy:   sheet.created_by,
      createdAt:   sheet.created_at,
      updatedAt:   sheet.updated_at,
    };
  },

  async updateStatus(sheetId: string, status: LorryLoadingSheet['status']): Promise<void> {
    const { error } = await supabase.from('lorry_loading_sheets').update({ status, updated_at: new Date().toISOString() }).eq('id', sheetId);
    if (error) throw error;
  },
};

// ─────────────────────────────────────────────────────────
// Delivery Record Services (collector field updates)
// ─────────────────────────────────────────────────────────
export const deliveryService = {
  async upsert(record: Omit<DeliveryRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const { error } = await supabase.from('delivery_records').upsert({
      sheet_id:        record.sheetId,
      booking_id:      record.bookingId,
      collector_id:    record.collectorId ?? null,
      delivery_status: record.deliveryStatus,
      payment_status:  record.paymentStatus,
      payment_method:  record.paymentMethod ?? null,
      cheque_number:   record.chequeNumber ?? null,
      cash_amount:     record.cashAmount,
      credit_amount:   record.creditAmount,
      adjusted_items:  record.adjustedItems ? JSON.stringify(record.adjustedItems) : null,
      cancelled_items: record.cancelledItems ? JSON.stringify(record.cancelledItems) : null,
      gps_latitude:    record.gpsLocation?.latitude ?? null,
      gps_longitude:   record.gpsLocation?.longitude ?? null,
      delivered_at:    record.deliveredAt ?? null,
      notes:           record.notes ?? null,
      updated_at:      new Date().toISOString(),
    }, { onConflict: 'sheet_id,booking_id' });
    if (error) throw error;

    // Booking status sync
    await supabase.from('bookings').update({
      status:     record.deliveryStatus === 'DELIVERED' ? 'DELIVERED' : record.deliveryStatus === 'PARTIALLY_DELIVERED' ? 'PARTIALLY_DELIVERED' : record.deliveryStatus === 'CANCELLED' ? 'CANCELLED' : 'OUT_FOR_DELIVERY',
      updated_at: new Date().toISOString(),
    }).eq('id', record.bookingId);
  },

  async getBySheet(sheetId: string): Promise<DeliveryRecord[]> {
    const { data, error } = await supabase.from('delivery_records').select('*').eq('sheet_id', sheetId);
    if (error) throw error;
    return (data ?? []).map(mapDelivery);
  },
};

function mapDelivery(d: Record<string, unknown>): DeliveryRecord {
  return {
    id:             d.id as string,
    sheetId:        d.sheet_id as string,
    bookingId:      d.booking_id as string,
    collectorId:    d.collector_id as string | undefined,
    deliveryStatus: d.delivery_status as DeliveryRecord['deliveryStatus'],
    paymentStatus:  d.payment_status as DeliveryRecord['paymentStatus'],
    paymentMethod:  d.payment_method as DeliveryRecord['paymentMethod'],
    chequeNumber:   d.cheque_number as string | undefined,
    cashAmount:     (d.cash_amount as number) ?? 0,
    creditAmount:   (d.credit_amount as number) ?? 0,
    adjustedItems:  d.adjusted_items ? JSON.parse(d.adjusted_items as string) : undefined,
    cancelledItems: d.cancelled_items ? JSON.parse(d.cancelled_items as string) : undefined,
    gpsLocation:    d.gps_latitude ? { latitude: d.gps_latitude as number, longitude: d.gps_longitude as number } : undefined,
    deliveredAt:    d.delivered_at as string | undefined,
    notes:          d.notes as string | undefined,
    createdAt:      d.created_at as string,
    updatedAt:      d.updated_at as string,
  };
}

// ─────────────────────────────────────────────────────────
// Bill Edit Approval Services
// ─────────────────────────────────────────────────────────
export const approvalService = {
  async request(req: Omit<BillEditApprovalRequest, 'id' | 'status' | 'approvedBy' | 'respondedAt' | 'responseNote' | 'createdAt' | 'updatedAt'>): Promise<BillEditApprovalRequest> {
    const { data, error } = await supabase
      .from('bill_edit_approval_requests')
      .insert({
        booking_id:     req.bookingId ?? null,
        delivery_id:    req.deliveryId ?? null,
        requested_by:   req.requestedBy,
        agency_id:      req.agencyId,
        reason:         req.reason,
        changes_before: req.changesBefore,
        changes_after:  req.changesAfter,
        status:         'PENDING',
      })
      .select().single();
    if (error) throw error;
    return mapApproval(data);
  },

  async respond(requestId: string, status: 'APPROVED' | 'REJECTED', approvedBy: string, responseNote?: string): Promise<void> {
    const { error } = await supabase.from('bill_edit_approval_requests').update({
      status,
      approved_by:   approvedBy,
      responded_at:  new Date().toISOString(),
      response_note: responseNote ?? null,
      updated_at:    new Date().toISOString(),
    }).eq('id', requestId);
    if (error) throw error;
  },

  async getPending(agencyId: string): Promise<BillEditApprovalRequest[]> {
    const { data, error } = await supabase
      .from('bill_edit_approval_requests').select('*').eq('agency_id', agencyId).eq('status', 'PENDING')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapApproval);
  },
};

function mapApproval(a: Record<string, unknown>): BillEditApprovalRequest {
  return {
    id:              a.id as string,
    bookingId:       a.booking_id as string | undefined,
    deliveryId:      a.delivery_id as string | undefined,
    requestedBy:     a.requested_by as string,
    requestedByName: '',
    agencyId:        a.agency_id as string,
    reason:          a.reason as string,
    changesBefore:   a.changes_before as Record<string, unknown>,
    changesAfter:    a.changes_after as Record<string, unknown>,
    status:          a.status as BillEditApprovalRequest['status'],
    approvedBy:      a.approved_by as string | undefined,
    respondedAt:     a.responded_at as string | undefined,
    responseNote:    a.response_note as string | undefined,
    createdAt:       a.created_at as string,
    updatedAt:       a.updated_at as string,
  };
}
