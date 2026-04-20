export const getUserContactConfirmationTemplate = ({
  firstName,
  lastName,
  message
}) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #2c3e50;">📩 We've Received Your Message</h2>
      
      <p>Hi <strong>${firstName} ${lastName}</strong>,</p>
      
      <p>Thank you for reaching out to us. We have received your message and our team will get back to you as soon as possible.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #495057;">Your Message Summary</h3>
        <p style="font-style: italic; color: #666;">"${message}"</p>
      </div>
      
      <p>In the meantime, feel free to browse our website for more information.</p>
      
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      
      <p style="color: #999; font-size: 12px;">
        This is an automated confirmation email. Please do not reply directly to this message.
      </p>
      <p style="color: #999; font-size: 12px;">
        &copy; ${new Date().getFullYear()} Hinkle Creek. All rights reserved.
      </p>
    </div>
  `;
};
