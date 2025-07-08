export const generateIssueReportEmail = (issueReport: any, userInfo: any) => {
  const priorityBadge = {
    low: '🟢 Low',
    medium: '🟡 Medium',
    high: '🟠 High',
    urgent: '🔴 Urgent',
  };

  const categoryIcon = {
    bug: '🐛',
    transaction: '💳',
    ui_ux: '🎨',
    feature_request: '✨',
    account: '👤',
    other: '❓',
  };

  const categoryLabel = {
    bug: 'Bug Report',
    transaction: 'Transaction Issue',
    ui_ux: 'UI/UX Issue',
    feature_request: 'Feature Request',
    account: 'Account Issue',
    other: 'Other',
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Issue Report - ${issueReport.title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 700px; margin: 0 auto; padding: 20px;">
          
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🚨 New Issue Report</h1>
            <p style="color: #e2e8f0; margin: 5px 0 0 0; font-size: 14px;">Submitted ${new Date(issueReport.createdAt).toLocaleString()}</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 25px; margin: 20px 0; border-radius: 10px; border-left: 4px solid #667eea;">
            <h2 style="color: #1e293b; margin-bottom: 15px; font-size: 20px;">${issueReport.title}</h2>
            
            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
              <div style="flex: 1;">
                <p style="margin: 5px 0;"><strong>Category:</strong> ${categoryIcon[issueReport.category]} ${categoryLabel[issueReport.category]}</p>
                <p style="margin: 5px 0;"><strong>Priority:</strong> ${priorityBadge[issueReport.priority]}</p>
                <p style="margin: 5px 0;"><strong>Issue ID:</strong> #${issueReport.id}</p>
              </div>
            </div>
          </div>

          <div style="background-color: #ffffff; padding: 25px; margin: 20px 0; border-radius: 10px; border: 1px solid #e2e8f0;">
            <h3 style="color: #374151; margin-bottom: 15px;">👤 User Information</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${userInfo?.firstName || 'Unknown'} ${userInfo?.lastName || 'User'}</p>
            <p style="margin: 5px 0;"><strong>User ID:</strong> ${issueReport.userId}</p>
            <p style="margin: 5px 0;"><strong>Submitted:</strong> ${new Date(issueReport.createdAt).toLocaleDateString()} at ${new Date(issueReport.createdAt).toLocaleTimeString()}</p>
          </div>

          <div style="background-color: #ffffff; padding: 25px; margin: 20px 0; border-radius: 10px; border: 1px solid #e2e8f0;">
            <h3 style="color: #374151; margin-bottom: 15px;">📝 Issue Description</h3>
            <div style="padding: 15px; background-color: #f8fafc; border-radius: 8px; border-left: 3px solid #667eea;">
              ${issueReport.description}
            </div>
          </div>

          ${
            issueReport.imageUrls && issueReport.imageUrls.length > 0
              ? `
          <div style="background-color: #ffffff; padding: 25px; margin: 20px 0; border-radius: 10px; border: 1px solid #e2e8f0;">
            <h3 style="color: #374151; margin-bottom: 15px;">📸 Attached Images</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">
              ${issueReport.imageUrls
                .map(
                  (url: string, index: number) => `
                <div style="text-align: center; padding: 10px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                  <img src="${url}" alt="Issue Evidence ${index + 1}" style="max-width: 100%; height: auto; border-radius: 6px; margin-bottom: 8px;" />
                  <p style="margin: 0; color: #64748b; font-size: 12px;">Image ${index + 1}</p>
                </div>
              `,
                )
                .join('')}
            </div>
          </div>
          `
              : ''
          }

          <div style="background-color: #f0f9ff; padding: 20px; margin: 20px 0; border-radius: 10px; border: 1px solid #bae6fd;">
            <h4 style="color: #0c4a6e; margin-bottom: 10px;">💡 Next Steps</h4>
            <ul style="margin: 0; padding-left: 20px; color: #164e63;">
              <li>Review the issue details above</li>
              <li>Reproduce the issue if it's a bug</li>
              <li>Reply directly to this email to communicate with the user</li>
              <li>Update issue status internally when resolved</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f8fafc; border-radius: 10px;">
            <p style="margin: 0; color: #64748b; font-size: 14px;">
              <strong>Reply to this email</strong> to respond directly to the user who submitted this issue.
            </p>
            <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 12px;">
              Issue submitted via Event Platform Support System
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0;">
              This email was automatically generated by the Event Platform Support System.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};
