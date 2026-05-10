const verificationCodeTemplate = ({
  code,
  recipientName = 'there',
  brandName = 'SktchLABS',
  supportEmail = '',
  expiresInMinutes = 15,
  purpose = 'email_verification'
}) => {
  const isEmailVerification = purpose === 'email_verification';
  const heading = isEmailVerification ? 'Verify your email address' : 'Reset your password';
  const intro = isEmailVerification
    ? `Use the code below to finish creating your ${brandName} account.`
    : `Use the code below to continue resetting your ${brandName} password.`;
  const actionCopy = isEmailVerification
    ? 'Enter this code on the verification screen to activate your account.'
    : 'Enter this code on the password reset screen to continue.';
  const senderCopy = supportEmail
    ? `This email was sent by ${brandName} from ${supportEmail}.`
    : `This email was sent by ${brandName}.`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fffaf5; border: 1px solid #f2dfd1; border-radius: 18px; overflow: hidden; color: #3f3227;">
      <div style="background: linear-gradient(135deg, #f59c47, #e56b2f); padding: 28px 24px; color: #ffffff;">
        <p style="margin: 0; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.9;">${brandName}</p>
        <h1 style="margin: 12px 0 0; font-size: 28px; line-height: 1.2;">${heading}</h1>
      </div>
      <div style="padding: 28px 24px;">
        <p style="margin: 0 0 12px; font-size: 16px;">Hi ${recipientName},</p>
        <p style="margin: 0 0 12px; font-size: 16px; line-height: 1.6;">${intro}</p>
        <div style="margin: 24px 0; padding: 18px; border-radius: 16px; background: #ffffff; border: 1px dashed #f59c47; text-align: center;">
          <p style="margin: 0 0 10px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.12em; color: #9a6d4c;">Verification code</p>
          <p style="margin: 0; font-size: 34px; font-weight: 700; letter-spacing: 0.35em; color: #e56b2f;">${code}</p>
        </div>
        <p style="margin: 0 0 10px; font-size: 15px; line-height: 1.6;">${actionCopy}</p>
        <p style="margin: 0 0 10px; font-size: 15px; line-height: 1.6;">This code expires in ${expiresInMinutes} minutes.</p>
        <p style="margin: 18px 0 0; font-size: 14px; color: #6b5a4d; line-height: 1.6;">${senderCopy} If you did not request this, you can safely ignore this message.</p>
      </div>
    </div>
  `;
};

export default verificationCodeTemplate;


export const getPaymentSuccessTemplate = ({ name, eventId, slots }) => {
  const slotDetails = slots
    .map(
      (slot, index) =>
        `<li><strong>Slot ${index + 1}:</strong> ${slot.date} from ${slot.startTime} to ${slot.endTime}</li>`
    )
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>✅ Booking Confirmed</h2>
      <p>Dear ${name},</p>
      <p>Your payment has been successfully received and your booking has been confirmed.</p>
      <p><strong>Event ID:</strong> ${eventId}</p>
      <p><strong>Slot(s) Booked:</strong></p>
      <ul>
        ${slotDetails}
      </ul>
      <br />
      <p>Thank you for choosing our service.</p>
      <p>We look forward to seeing you at the event.</p>
      <br />
    
      
    </div>
  `;
};


// auto refunded template

export const getConflictAfterPaymentTemplate = ({
  name,
  email,
  phone,
  eventId,
  eventTitle,
  selectedDate,
  selectedSlots = [],
  sessionId,
  paymentIntentId,
  refundAmount,
}) => {
  const slotDetails = selectedSlots
    .map(
      (slot, index) =>
        `<li><strong>Slot ${index + 1}:</strong> ${slot.date} from ${slot.startTime} to ${slot.endTime}</li>`
    )
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>⚠️ Booking Conflict Detected After Payment</h2>

      <p><strong>Customer Details:</strong></p>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Phone:</strong> ${phone}</li>
      </ul>

      <p><strong>Event Details:</strong></p>
      <ul>
        <li><strong>Event ID:</strong> ${eventId}</li>
        <li><strong>Event Title:</strong> ${eventTitle || 'N/A'}</li>
        <li><strong>Date:</strong> ${selectedDate}</li>
      </ul>

      <p><strong>Attempted Slot(s):</strong></p>
      <ul>
        ${slotDetails}
      </ul>

      <p><strong>Stripe Info:</strong></p>
      <ul>
        <li><strong>Session ID:</strong> ${sessionId}</li>
        <li><strong>Payment Intent ID:</strong> ${paymentIntentId}</li>
        ${
          refundAmount
            ? `<li><strong>Refund Amount:</strong> $${(refundAmount / 100).toFixed(2)}</li>`
            : ''
        }
        <li><strong>Refund Status:</strong> Refund automatically processed</li>
      </ul>

      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>

      <br />
      <p style="color: red;">
        ⚠️ Some of the selected slots were already booked by the time payment completed.<br/>
        The booking was not created, and the payment has been refunded.
      </p>
    </div>
  `;
};

export const getPaymentSuccessForAdminTemplate = ({ name, email, phone, eventId, slots }) => {
  const slotDetails = slots
    .map(
      (slot, index) =>
        `<li><strong>Slot ${index + 1}:</strong> ${slot.date} from ${slot.startTime} to ${slot.endTime}</li>`
    )
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>📥 New Booking Received</h2>
      <p><strong>User Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Event ID:</strong> ${eventId}</p>
      <p><strong>Slot(s) Booked:</strong></p>
      <ul>
        ${slotDetails}
      </ul>
      <br />
      <p>This booking has been paid and confirmed via Stripe.</p>
      <p>Please make necessary arrangements for the event.</p>
    </div>
  `;
};
