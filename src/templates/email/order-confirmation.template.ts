export const generateOrderConfirmationEmail = (order: any, event: any) => {
  const ticketsList = order.items
    .map(
      (item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${Math.round(item.price).toLocaleString('vi-VN')} VND</td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${event.orgLogoUrl}" alt="${event.orgName}" style="max-width: 200px;">
          </div>
          
          <h2 style="color: #2c3e50; margin-bottom: 20px;">Order Confirmation</h2>
          
          <p>Dear ${order.firstName} ${order.lastName},</p>
          
          <p>Thank you for your order! We're excited to confirm your tickets for <strong>${event.eventName}</strong>.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">Order Details</h3>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <thead>
                <tr style="background-color: #eee;">
                  <th style="padding: 10px; text-align: left;">Ticket Type</th>
                  <th style="padding: 10px; text-align: left;">Quantity</th>
                  <th style="padding: 10px; text-align: left;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${ticketsList}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
                  <td style="padding: 10px;"><strong>${Math.round(order.subtotalAmount).toLocaleString('vi-VN')} VND</strong></td>
                </tr>
                ${order.platformDiscountAmount ? `
                <tr>
                  <td colspan="2" style="padding: 10px; text-align: right;"><strong>Discount:</strong></td>
                  <td style="padding: 10px;"><strong>-${Math.round(order.platformDiscountAmount).toLocaleString('vi-VN')} VND</strong></td>
                </tr>
                ` : ''}
                <tr>
                  <td colspan="2" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
                  <td style="padding: 10px;"><strong>${Math.round(order.totalAmount).toLocaleString('vi-VN')} VND</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #2c3e50;">Event Details</h3>
            <p><strong>Event:</strong> ${event.eventName}</p>
            <p><strong>Venue:</strong> ${event.venueName}</p>
            <p><strong>Address:</strong> ${event.street}</p>
          </div>

          <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
            <p style="margin: 0;">If you have any questions about your order, please don't hesitate to contact us.</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">This is an automated email, please do not reply directly to this message.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
