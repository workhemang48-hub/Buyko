import jsPDF from 'jspdf';

export function generateInvoicePDF(order) {
  const doc = new jsPDF();
  let y = 20;

  // Header
  doc.setFontSize(18);
  doc.text('Buyko', 14, y);
  doc.setFontSize(12);
  doc.text('Invoice', 180, y, { align: 'right' });
  y += 8;

  doc.setFontSize(10);
  doc.text(`Order ID: ${order._id}`, 14, y);
  y += 5;
  doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, y);
  y += 10;

  // Shipping address
  doc.setFontSize(12);
  doc.text('Shipping Address', 14, y);
  y += 6;
  doc.setFontSize(10);
  const addr = order.shippingAddress;
  doc.text(addr.fullName, 14, y); y += 5;
  doc.text(addr.phone, 14, y); y += 5;
  doc.text(addr.addressLine1, 14, y); y += 5;
  if (addr.addressLine2) { doc.text(addr.addressLine2, 14, y); y += 5; }
  doc.text(`${addr.city}, ${addr.state} - ${addr.pincode}`, 14, y); y += 5;
  doc.text(addr.country, 14, y); y += 10;

  // Items table header
  doc.setFontSize(12);
  doc.text('Items', 14, y);
  y += 6;
  doc.setFontSize(10);
  doc.text('Name', 14, y);
  doc.text('Size', 90, y);
  doc.text('Qty', 115, y);
  doc.text('Price', 140, y);
  doc.text('Amount', 170, y);
  y += 2;
  doc.line(14, y, 196, y);
  y += 6;

  // Items rows
  order.items.forEach((item) => {
    doc.text(item.name, 14, y);
    doc.text(item.size, 90, y);
    doc.text(String(item.quantity), 115, y);
    doc.text(`Rs.${item.price}`, 140, y);
    doc.text(`Rs.${item.price * item.quantity}`, 170, y);
    y += 6;
  });

  y += 4;
  doc.line(14, y, 196, y);
  y += 8;

  // Totals
  doc.text(`Subtotal: Rs.${order.subtotal}`, 140, y); y += 6;
  doc.text(`GST: Rs.${order.gst}`, 140, y); y += 6;
  doc.text(`Delivery: Rs.${order.deliveryCharge}`, 140, y); y += 6;
  doc.setFontSize(12);
  doc.text(`Total: Rs.${order.total}`, 140, y);

  doc.save(`invoice-${order._id}.pdf`);
}