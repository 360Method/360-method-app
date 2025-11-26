// Email templates for critical events
// Each template returns { subject, html, text }

const APP_URL = Deno.env.get('APP_URL') || 'https://app.360method.com';
const LOGO_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6911a3ab5b84ed3aa2d106c2/ea24cb40a_GreyProfessionalMonogramCircularBrandLogo.png';
const PRIMARY_COLOR = '#1B365D';
const ACCENT_COLOR = '#FF6B35';

function baseTemplate(content, unsubscribeUrl) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #F5F5F5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F5F5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 8px; overflow: hidden; max-width: 100%;">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: ${PRIMARY_COLOR};">
              <img src="${LOGO_URL}" alt="360° Method" style="width: 60px; height: 60px; border-radius: 12px;">
              <h1 style="margin: 12px 0 0 0; color: #FFFFFF; font-size: 20px; font-weight: 600;">360° Method</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #F9F9F9; border-top: 1px solid #E5E5E5;">
              <p style="margin: 0 0 12px 0; font-size: 14px; color: #666; line-height: 1.6;">
                360° Method - Own. Build. Grow.<br>
                Professional property maintenance and asset management.
              </p>
              <p style="margin: 0; font-size: 12px; color: #999;">
                <a href="${APP_URL}/settings/notifications" style="color: ${ACCENT_COLOR}; text-decoration: none;">Notification Settings</a>
                ${unsubscribeUrl ? ` · <a href="${unsubscribeUrl}" style="color: #999; text-decoration: none;">Unsubscribe</a>` : ''}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function ctaButton(text, url) {
  return `
    <table cellpadding="0" cellspacing="0" style="margin: 30px 0;">
      <tr>
        <td style="border-radius: 6px; background-color: ${ACCENT_COLOR};">
          <a href="${url}" style="display: inline-block; padding: 14px 32px; color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 16px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

function infoBox(label, value) {
  return `
    <div style="margin: 20px 0; padding: 16px; background-color: #F9F9F9; border-radius: 6px; border-left: 4px solid ${ACCENT_COLOR};">
      <p style="margin: 0 0 4px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">${label}</p>
      <p style="margin: 0; font-size: 16px; color: #333; font-weight: 500;">${value}</p>
    </div>
  `;
}

export const emailTemplates = {
  
  // 1. Service Package Submitted → Operator
  service_package_submitted: (data) => {
    const content = `
      <h2 style="margin: 0 0 20px 0; color: ${PRIMARY_COLOR}; font-size: 24px; font-weight: 600;">
        New Service Request
      </h2>
      <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
        You have a new service request from <strong>${data.customer_name}</strong>.
      </p>
      ${infoBox('Property Address', data.property_address)}
      ${infoBox('Items Requested', `${data.item_count} service${data.item_count !== 1 ? 's' : ''}`)}
      ${data.total_cost_estimate ? infoBox('Estimated Total', `$${data.total_cost_estimate.toFixed(2)}`) : ''}
      <p style="margin: 24px 0 0 0; font-size: 16px; color: #333; line-height: 1.6;">
        Review the request and provide your quote to the customer.
      </p>
      ${ctaButton('Review Request', `${APP_URL}${data.review_url}`)}
      <p style="margin: 20px 0 0 0; font-size: 14px; color: #666; line-height: 1.6;">
        <strong>Customer Notes:</strong><br>
        ${data.customer_notes || 'No additional notes provided'}
      </p>
    `;
    
    return {
      subject: `New Service Request - ${data.customer_name}`,
      html: baseTemplate(content, data.unsubscribe_url),
      text: `New Service Request\n\nCustomer: ${data.customer_name}\nProperty: ${data.property_address}\nItems: ${data.item_count}\n\nReview request: ${APP_URL}${data.review_url}`
    };
  },

  // 2. Service Package Quoted → Homeowner
  service_package_quoted: (data) => {
    const content = `
      <h2 style="margin: 0 0 20px 0; color: ${PRIMARY_COLOR}; font-size: 24px; font-weight: 600;">
        Your Quote is Ready
      </h2>
      <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
        <strong>${data.operator_name}</strong> has prepared a quote for your service request.
      </p>
      ${infoBox('Service Package', data.package_name)}
      ${infoBox('Total Cost', `$${data.total_cost.toFixed(2)}`)}
      ${data.estimated_hours ? infoBox('Estimated Time', `${data.estimated_hours} hours`) : ''}
      ${data.valid_until ? `
        <p style="margin: 20px 0 0 0; font-size: 14px; color: #666;">
          This quote is valid until <strong>${new Date(data.valid_until).toLocaleDateString()}</strong>
        </p>
      ` : ''}
      ${ctaButton('Review & Approve Quote', `${APP_URL}${data.approval_url}`)}
      ${data.operator_notes ? `
        <p style="margin: 20px 0 0 0; font-size: 14px; color: #666; line-height: 1.6;">
          <strong>Operator Notes:</strong><br>
          ${data.operator_notes}
        </p>
      ` : ''}
    `;
    
    return {
      subject: `Quote Ready - ${data.package_name}`,
      html: baseTemplate(content, data.unsubscribe_url),
      text: `Quote Ready\n\nOperator: ${data.operator_name}\nTotal: $${data.total_cost.toFixed(2)}\n\nReview quote: ${APP_URL}${data.approval_url}`
    };
  },

  // 3. Service Package Approved → Operator
  service_package_approved: (data) => {
    const content = `
      <h2 style="margin: 0 0 20px 0; color: ${PRIMARY_COLOR}; font-size: 24px; font-weight: 600;">
        Quote Approved! ✓
      </h2>
      <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
        <strong>${data.customer_name}</strong> has approved your quote. Time to get to work!
      </p>
      ${infoBox('Service Package', data.package_name)}
      ${infoBox('Property Address', data.property_address)}
      ${data.scheduled_date ? infoBox('Scheduled Date', new Date(data.scheduled_date).toLocaleDateString()) : ''}
      ${infoBox('Approved Amount', `$${data.approved_amount.toFixed(2)}`)}
      ${ctaButton('View Work Order', `${APP_URL}${data.work_order_url}`)}
      <p style="margin: 20px 0 0 0; font-size: 14px; color: #666; line-height: 1.6;">
        The customer has been charged and funds will be transferred to your account upon completion.
      </p>
    `;
    
    return {
      subject: `Quote Approved - ${data.customer_name}`,
      html: baseTemplate(content, data.unsubscribe_url),
      text: `Quote Approved!\n\nCustomer: ${data.customer_name}\nPackage: ${data.package_name}\nAmount: $${data.approved_amount.toFixed(2)}\n\nView work order: ${APP_URL}${data.work_order_url}`
    };
  },

  // 4. Payment Succeeded → Homeowner
  payment_succeeded: (data) => {
    const content = `
      <h2 style="margin: 0 0 20px 0; color: ${PRIMARY_COLOR}; font-size: 24px; font-weight: 600;">
        Payment Confirmed ✓
      </h2>
      <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
        Your payment has been processed successfully.
      </p>
      ${infoBox('Amount Paid', `$${data.amount.toFixed(2)}`)}
      ${infoBox('Payment For', data.description)}
      ${data.payment_method_last4 ? infoBox('Payment Method', `•••• ${data.payment_method_last4}`) : ''}
      ${infoBox('Transaction ID', data.transaction_id.substring(0, 12) + '...')}
      ${ctaButton('View Receipt', `${APP_URL}${data.receipt_url}`)}
      <p style="margin: 20px 0 0 0; font-size: 14px; color: #666; line-height: 1.6;">
        A copy of your receipt has been saved to your account for your records.
      </p>
    `;
    
    return {
      subject: `Payment Confirmed - $${data.amount.toFixed(2)}`,
      html: baseTemplate(content, data.unsubscribe_url),
      text: `Payment Confirmed\n\nAmount: $${data.amount.toFixed(2)}\nFor: ${data.description}\nTransaction: ${data.transaction_id}\n\nView receipt: ${APP_URL}${data.receipt_url}`
    };
  },

  // 5. Payment Failed → Homeowner
  payment_failed: (data) => {
    const content = `
      <h2 style="margin: 0 0 20px 0; color: #DC3545; font-size: 24px; font-weight: 600;">
        Payment Issue
      </h2>
      <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
        We were unable to process your payment.
      </p>
      ${infoBox('Attempted Amount', `$${data.amount.toFixed(2)}`)}
      ${infoBox('Payment For', data.description)}
      ${data.failure_reason ? `
        <div style="margin: 20px 0; padding: 16px; background-color: #FFF3CD; border-radius: 6px; border-left: 4px solid #DC3545;">
          <p style="margin: 0; font-size: 14px; color: #856404;">
            <strong>Reason:</strong> ${data.failure_reason}
          </p>
        </div>
      ` : ''}
      <p style="margin: 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
        Please update your payment method and try again. If this issue persists, contact your bank.
      </p>
      ${ctaButton('Update Payment Method', `${APP_URL}${data.payment_method_url}`)}
    `;
    
    return {
      subject: `Payment Failed - Action Required`,
      html: baseTemplate(content, data.unsubscribe_url),
      text: `Payment Failed\n\nAmount: $${data.amount.toFixed(2)}\nReason: ${data.failure_reason || 'Unknown'}\n\nUpdate payment method: ${APP_URL}${data.payment_method_url}`
    };
  },

  // 6. Inspection Due → Homeowner
  inspection_due: (data) => {
    const content = `
      <h2 style="margin: 0 0 20px 0; color: ${PRIMARY_COLOR}; font-size: 24px; font-weight: 600;">
        Time for Your ${data.season} Inspection
      </h2>
      <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
        Your seasonal inspection is coming up. Regular inspections help catch small issues before they become expensive problems.
      </p>
      ${infoBox('Property', data.property_address)}
      ${infoBox('Inspection Type', `${data.season} Seasonal Inspection`)}
      ${data.recommended_date ? infoBox('Recommended By', new Date(data.recommended_date).toLocaleDateString()) : ''}
      <p style="margin: 24px 0 0 0; font-size: 16px; color: #333; line-height: 1.6;">
        The ${data.season.toLowerCase()} inspection typically takes 30-45 minutes and covers:
      </p>
      <ul style="margin: 12px 0; padding-left: 20px; font-size: 15px; color: #333; line-height: 1.8;">
        ${data.inspection_items ? data.inspection_items.map(item => `<li>${item}</li>`).join('') : `
          <li>System condition checks</li>
          <li>Safety hazard identification</li>
          <li>Maintenance recommendations</li>
        `}
      </ul>
      ${ctaButton('Start Inspection', `${APP_URL}${data.inspection_url}`)}
      <p style="margin: 20px 0 0 0; font-size: 14px; color: #666; line-height: 1.6;">
        Pro tip: Complete your inspection and we'll automatically prioritize any issues found.
      </p>
    `;
    
    return {
      subject: `${data.season} Inspection Reminder - ${data.property_address}`,
      html: baseTemplate(content, data.unsubscribe_url),
      text: `${data.season} Inspection Due\n\nProperty: ${data.property_address}\n\nStart inspection: ${APP_URL}${data.inspection_url}`
    };
  }

};

export default emailTemplates;