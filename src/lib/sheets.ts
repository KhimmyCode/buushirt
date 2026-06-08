import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

export interface OrderRow {
  OrderID: string;
  Timestamp: string;
  Email: string;
  CustomerName: string;
  ShippingAddress: string;
  Phone: string;
  TotalItems: number;
  TotalPrice: number;
  SlipUrl: string;
  Status: string; // e.g. "รอตรวจสอบ", "กำลังผลิต", "จัดส่งแล้ว"
  TrackingNumber: string;
  PromoCode?: string;
}

export interface OrderItemRow {
  OrderID: string;
  ItemIndex: number;
  DesignName: string;
  Size: string;
  PrintName: string;
  BackNumber: string;
  CustomText: string; // Custom Text Extra
  ItemPrice: number;
}

const LOCAL_DB_PATH = path.join(process.cwd(), 'src/data/localDb.json');

// Helper to ensure local database exists
function ensureLocalDb() {
  const dir = path.dirname(LOCAL_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify({ orders: [], orderItems: [], deletedOrderIds: [] }, null, 2), 'utf-8');
  } else {
    // Migrate existing DBs that don't have deletedOrderIds
    const data = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8'));
    if (!data.deletedOrderIds) {
      data.deletedOrderIds = [];
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    }
  }
}

// Check if Google Sheets credentials are configured
function isSheetsConfigured(): boolean {
  return !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY &&
    process.env.GOOGLE_SPREADSHEET_ID
  );
}

// Get Google Sheets API instance
function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

/**
 * Save a new order and its items
 */
export async function saveOrder(order: OrderRow, items: OrderItemRow[]): Promise<void> {
  if (isSheetsConfigured()) {
    try {
      const sheets = getSheetsClient();
      const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;

      // 1. Append to Orders
      // Schema: OrderID | Timestamp | Email | CustomerName | ShippingAddress | Phone | TotalItems | TotalPrice | SlipUrl | Status | TrackingNumber | PromoCode
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Orders!A:L',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [
            [
              order.OrderID,
              order.Timestamp,
              order.Email,
              order.CustomerName,
              order.ShippingAddress,
              order.Phone,
              order.TotalItems,
              order.TotalPrice,
              order.SlipUrl,
              order.Status,
              order.TrackingNumber,
              order.PromoCode || '',
            ],
          ],
        },
      });

      // 2. Append to OrderItems
      // Schema: OrderID | ItemIndex | DesignName | Size | PrintName | BackNumber | CustomText | ItemPrice
      const itemValues = items.map((item) => [
        item.OrderID,
        item.ItemIndex,
        item.DesignName,
        item.Size,
        item.PrintName,
        item.BackNumber,
        item.CustomText,
        item.ItemPrice,
      ]);

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'OrderItems!A:H',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: itemValues,
        },
      });
      return;
    } catch (error) {
      console.error('Error saving to Google Sheets, falling back to local database:', error);
      // Fall through to local DB
    }
  }

  // Local fallback
  ensureLocalDb();
  const dbData = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8'));
  dbData.orders.push(order);
  dbData.orderItems.push(...items);
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(dbData, null, 2), 'utf-8');
}

/**
 * Retrieve order history for a specific email
 */
export async function getOrderHistory(email: string): Promise<{ order: OrderRow; items: OrderItemRow[] }[]> {
  const lowercaseEmail = email.toLowerCase().trim();

  if (isSheetsConfigured()) {
    try {
      const sheets = getSheetsClient();
      const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;

      // Fetch Orders
      const ordersRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Orders!A:L',
      });
      const orderRows = ordersRes.data.values || [];
      if (orderRows.length <= 1) return []; // Only headers or empty

      // Find user orders (Skip header row at index 0)
      const userOrders: OrderRow[] = [];
      for (let i = 1; i < orderRows.length; i++) {
        const row = orderRows[i];
        if (row[2]?.toLowerCase().trim() === lowercaseEmail) {
          userOrders.push({
            OrderID: row[0] || '',
            Timestamp: row[1] || '',
            Email: row[2] || '',
            CustomerName: row[3] || '',
            ShippingAddress: row[4] || '',
            Phone: row[5] || '',
            TotalItems: parseInt(row[6] || '0', 10),
            TotalPrice: parseFloat(row[7] || '0'),
            SlipUrl: row[8] || '',
            Status: row[9] || 'รอตรวจสอบ',
            TrackingNumber: row[10] || '',
            PromoCode: row[11] || '',
          });
        }
      }

      if (userOrders.length === 0) return [];

      // Fetch OrderItems
      const itemsRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'OrderItems!A:H',
      });
      const itemRows = itemsRes.data.values || [];

      // Group items by OrderID (Skip header at index 0)
      const itemsByOrderId: Record<string, OrderItemRow[]> = {};
      for (let i = 1; i < itemRows.length; i++) {
        const row = itemRows[i];
        const orderId = row[0] || '';
        if (!itemsByOrderId[orderId]) {
          itemsByOrderId[orderId] = [];
        }
        itemsByOrderId[orderId].push({
          OrderID: orderId,
          ItemIndex: parseInt(row[1] || '0', 10),
          DesignName: row[2] || '',
          Size: row[3] || '',
          PrintName: row[4] || '',
          BackNumber: row[5] || '',
          CustomText: row[6] || '',
          ItemPrice: parseFloat(row[7] || '0'),
        });
      }

      // Map combined results
      return userOrders.map((order) => ({
        order,
        items: itemsByOrderId[order.OrderID] || [],
      }));
    } catch (error) {
      console.error('Error fetching from Google Sheets, falling back to local database:', error);
      // Fall through to local DB
    }
  }

  // Local fallback
  ensureLocalDb();
  const dbData = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8'));
  const filteredOrders = dbData.orders.filter((o: OrderRow) => o.Email.toLowerCase().trim() === lowercaseEmail);

  return filteredOrders.map((order: OrderRow) => {
    const items = dbData.orderItems.filter((item: OrderItemRow) => item.OrderID === order.OrderID);
    return { order, items };
  });
}

/**
 * Retrieve ALL orders (admin use)
 */
export async function getAllOrders(): Promise<{ order: OrderRow; items: OrderItemRow[] }[]> {
  if (isSheetsConfigured()) {
    try {
      const sheets = getSheetsClient();
      const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;

      const ordersRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Orders!A:L',
      });
      const orderRows = ordersRes.data.values || [];
      if (orderRows.length <= 1) return [];

      const allOrders: OrderRow[] = [];
      for (let i = 1; i < orderRows.length; i++) {
        const row = orderRows[i];
        allOrders.push({
          OrderID: row[0] || '',
          Timestamp: row[1] || '',
          Email: row[2] || '',
          CustomerName: row[3] || '',
          ShippingAddress: row[4] || '',
          Phone: row[5] || '',
          TotalItems: parseInt(row[6] || '0', 10),
          TotalPrice: parseFloat(row[7] || '0'),
          SlipUrl: row[8] || '',
          Status: row[9] || 'รอตรวจสอบ',
          TrackingNumber: row[10] || '',
          PromoCode: row[11] || '',
        });
      }

      const itemsRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'OrderItems!A:H',
      });
      const itemRows = itemsRes.data.values || [];

      const itemsByOrderId: Record<string, OrderItemRow[]> = {};
      for (let i = 1; i < itemRows.length; i++) {
        const row = itemRows[i];
        const orderId = row[0] || '';
        if (!itemsByOrderId[orderId]) itemsByOrderId[orderId] = [];
        itemsByOrderId[orderId].push({
          OrderID: orderId,
          ItemIndex: parseInt(row[1] || '0', 10),
          DesignName: row[2] || '',
          Size: row[3] || '',
          PrintName: row[4] || '',
          BackNumber: row[5] || '',
          CustomText: row[6] || '',
          ItemPrice: parseFloat(row[7] || '0'),
        });
      }

      return allOrders.map((order) => ({
        order,
        items: itemsByOrderId[order.OrderID] || [],
      }));
    } catch (error) {
      console.error('Error fetching all orders from Google Sheets, falling back to local database:', error);
    }
  }

  // Local fallback
  ensureLocalDb();
  const dbData = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8'));
  return dbData.orders.map((order: OrderRow) => {
    const items = dbData.orderItems.filter((item: OrderItemRow) => item.OrderID === order.OrderID);
    return { order, items };
  });
}

/**
 * Update order status and tracking number (admin use)
 */
export async function updateOrderStatus(
  orderId: string,
  status: string,
  trackingNumber: string
): Promise<void> {
  if (isSheetsConfigured()) {
    try {
      const sheets = getSheetsClient();
      const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;

      // Find the row number for this OrderID (column A)
      const ordersRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Orders!A:K',
      });
      const rows = ordersRes.data.values || [];

      let targetRowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === orderId) {
          targetRowIndex = i + 1; // 1-indexed, header is row 1
          break;
        }
      }

      if (targetRowIndex === -1) {
        throw new Error(`Order ${orderId} not found in Google Sheets`);
      }

      // Update columns J (Status = col 10) and K (TrackingNumber = col 11) in that row
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Orders!J${targetRowIndex}:K${targetRowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[status, trackingNumber]],
        },
      });
      return;
    } catch (error) {
      console.error('Error updating order status in Google Sheets, falling back to local database:', error);
    }
  }

  // Local fallback
  ensureLocalDb();
  const dbData = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8'));
  const orderIndex = dbData.orders.findIndex((o: OrderRow) => o.OrderID === orderId);
  if (orderIndex !== -1) {
    dbData.orders[orderIndex].Status = status;
    dbData.orders[orderIndex].TrackingNumber = trackingNumber;
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(dbData, null, 2), 'utf-8');
  }
}

/**
 * Soft-delete an order (marks as 'ถูกลบ' in Google Sheets, or local fallback)
 */
export async function deleteOrder(orderId: string): Promise<void> {
  if (isSheetsConfigured()) {
    try {
      const sheets = getSheetsClient();
      const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;

      // Find row index by OrderID
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Orders!A:A',
      });
      const rows = response.data.values || [];
      let targetRowIndex = -1;
      for (let i = 0; i < rows.length; i++) {
        if (rows[i][0] === orderId) {
          targetRowIndex = i + 1; // 1-indexed
          break;
        }
      }

      if (targetRowIndex !== -1) {
        // Update column J (Status = col 10) to "ถูกลบ"
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Orders!J${targetRowIndex}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [['ถูกลบ']],
          },
        });
        return;
      }
    } catch (error) {
      console.error('Error soft-deleting order in Google Sheets:', error);
    }
  }

  // Local fallback
  ensureLocalDb();
  const dbData = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8'));
  const orderIndex = dbData.orders.findIndex((o: OrderRow) => o.OrderID === orderId);
  if (orderIndex !== -1) {
    dbData.orders[orderIndex].Status = 'ถูกลบ';
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(dbData, null, 2), 'utf-8');
  }
}

/**
 * Get the list of soft-deleted order IDs (queries orders with status 'ถูกลบ')
 */
export async function getDeletedOrderIds(): Promise<string[]> {
  if (isSheetsConfigured()) {
    try {
      const sheets = getSheetsClient();
      const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Orders!A:J',
      });
      const rows = response.data.values || [];
      if (rows.length <= 1) return [];

      const deletedIds: string[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[9] === 'ถูกลบ') {
          deletedIds.push(row[0]);
        }
      }
      return deletedIds;
    } catch (error) {
      console.error('Error fetching deleted order IDs from Google Sheets:', error);
    }
  }

  ensureLocalDb();
  const dbData = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8'));
  const localDeleted = dbData.orders
    .filter((o: OrderRow) => o.Status === 'ถูกลบ')
    .map((o: OrderRow) => o.OrderID);
  return Array.from(new Set([...(dbData.deletedOrderIds || []), ...localDeleted]));
}

/**
 * Get active usage count of a promo code
 */
export async function getPromoCodeUsageCount(promoCode: string): Promise<number> {
  const lowercaseCode = promoCode.toLowerCase().trim();
  const allOrders = await getAllOrders();
  const deletedIds = await getDeletedOrderIds();
  const activeOrders = allOrders.filter(o => !deletedIds.includes(o.order.OrderID));
  return activeOrders.filter(o => (o.order.PromoCode || '').toLowerCase().trim() === lowercaseCode).length;
}
