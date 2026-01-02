import { Sale } from '@/types/types';
import { format } from 'date-fns';

interface ThermalReceiptProps {
  sale: Sale;
  storeName?: string;
  paperSize?: '55mm' | '88mm';
}

export const generateThermalReceipt = (props: ThermalReceiptProps) => {
  const { sale, storeName = 'مطعم البوفيه', paperSize = '88mm' } = props;
  
  const width = paperSize === '55mm' ? '55mm' : '88mm';
  const fontSize = paperSize === '55mm' ? '10px' : '12px';
  
  return `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          size: ${width} auto;
          margin: 0;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          width: ${width};
          font-family: 'Courier New', monospace;
          font-size: ${fontSize};
          padding: 5mm;
          direction: rtl;
          text-align: right;
        }
        .header {
          text-align: center;
          margin-bottom: 10px;
          border-bottom: 1px dashed #000;
          padding-bottom: 5px;
        }
        .store-name {
          font-size: ${paperSize === '55mm' ? '14px' : '16px'};
          font-weight: bold;
          margin-bottom: 5px;
        }
        .info-line {
          margin: 3px 0;
          font-size: ${paperSize === '55mm' ? '9px' : '11px'};
        }
        .items {
          margin: 10px 0;
          border-bottom: 1px dashed #000;
          padding-bottom: 5px;
        }
        .item-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        .item-name {
          flex: 1;
        }
        .item-qty {
          width: 30px;
          text-align: center;
        }
        .item-price {
          width: 60px;
          text-align: left;
        }
        .totals {
          margin: 10px 0;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        .total-label {
          font-weight: bold;
        }
        .grand-total {
          font-size: ${paperSize === '55mm' ? '12px' : '14px'};
          font-weight: bold;
          border-top: 1px solid #000;
          border-bottom: 1px solid #000;
          padding: 5px 0;
          margin: 5px 0;
        }
        .footer {
          text-align: center;
          margin-top: 10px;
          font-size: ${paperSize === '55mm' ? '9px' : '11px'};
          border-top: 1px dashed #000;
          padding-top: 5px;
        }
        @media print {
          body {
            width: ${width};
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="store-name">${storeName}</div>
        <div class="info-line">فاتورة مبيعات</div>
        <div class="info-line">رقم الفاتورة: ${sale.invoice_number}</div>
        <div class="info-line">التاريخ: ${sale.created_at ? format(new Date(sale.created_at), 'yyyy/MM/dd HH:mm') : ''}</div>
        <div class="info-line">الكاشير: ${sale.cashier?.username || '-'}</div>
        ${sale.customer ? `<div class="info-line">العميل: ${sale.customer.name}</div>` : ''}
      </div>

      <div class="items">
        <div class="item-row" style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 3px;">
          <div class="item-name">الصنف</div>
          <div class="item-qty">الكمية</div>
          <div class="item-price">السعر</div>
        </div>
        ${sale.sale_items?.map(item => `
          <div class="item-row">
            <div class="item-name">${item.product_name}</div>
            <div class="item-qty">${item.quantity}</div>
            <div class="item-price">${item.subtotal.toFixed(2)}</div>
          </div>
        `).join('') || ''}
      </div>

      <div class="totals">
        <div class="total-row">
          <div class="total-label">المجموع الفرعي:</div>
          <div>${sale.subtotal.toFixed(2)}</div>
        </div>
        ${sale.discount > 0 ? `
          <div class="total-row">
            <div class="total-label">الخصم:</div>
            <div>-${sale.discount.toFixed(2)}</div>
          </div>
        ` : ''}
        ${sale.tax > 0 ? `
          <div class="total-row">
            <div class="total-label">الضريبة:</div>
            <div>${sale.tax.toFixed(2)}</div>
          </div>
        ` : ''}
        <div class="total-row grand-total">
          <div class="total-label">الإجمالي:</div>
          <div>${sale.total.toFixed(2)}</div>
        </div>
        <div class="total-row">
          <div class="total-label">طريقة الدفع:</div>
          <div>${sale.payment_method === 'cash' ? 'نقدي' : sale.payment_method === 'card' ? 'بطاقة' : 'محفظة إلكترونية'}</div>
        </div>
        ${sale.payment_method === 'cash' && sale.amount_received ? `
          <div class="total-row">
            <div class="total-label">المبلغ المستلم:</div>
            <div>${sale.amount_received.toFixed(2)}</div>
          </div>
          <div class="total-row">
            <div class="total-label">الباقي:</div>
            <div>${(sale.change_amount || 0).toFixed(2)}</div>
          </div>
        ` : ''}
      </div>

      <div class="footer">
        <div>شكراً لزيارتكم</div>
        <div>نتمنى لكم يوماً سعيداً</div>
      </div>
    </body>
    </html>
  `;
};

export const printThermalReceipt = (sale: Sale, storeName?: string, paperSize?: '55mm' | '88mm') => {
  const receiptHtml = generateThermalReceipt({ sale, storeName, paperSize });
  
  // Create a hidden iframe for printing
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'absolute';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = 'none';
  
  document.body.appendChild(printFrame);
  
  const frameDoc = printFrame.contentWindow?.document;
  if (frameDoc) {
    frameDoc.open();
    frameDoc.write(receiptHtml);
    frameDoc.close();
    
    // Wait for content to load then print
    printFrame.onload = () => {
      setTimeout(() => {
        printFrame.contentWindow?.print();
        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      }, 250);
    };
  }
};
