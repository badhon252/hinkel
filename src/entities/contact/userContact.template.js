export const getUserContactConfirmationTemplate = ({
  firstName,
  lastName,
  message
}) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; color: #333;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 40px; margin-bottom: 10px;">📩</div>
        <h2 style="color: #ff8b36; margin: 0;">Message Received!</h2>
        <p style="color: #666; font-size: 16px;">We've received your inquiry</p>
      </div>
      
      <p>Hi <strong>${firstName} ${lastName}</strong>,</p>
      
      <p>Thank you for reaching out to Hinkle Creek! We have received your message and our team is already looking into it. You can expect a response from us within 2 business days.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #eee;">
        <h3 style="margin-top: 0; color: #495057; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Your Message Summary</h3>
        <p style="font-style: italic; color: #555; line-height: 1.6;">"${message}"</p>
      </div>
      
      <p>In the meantime, feel free to explore our latest coloring books on our website.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; text-align: center;">
        <p>This is an automated confirmation. Please do not reply directly to this email.</p>
        <p>&copy; ${new Date().getFullYear()} Hinkle Creek. All rights reserved.</p>
      </div>
    </div>
  `;
};
