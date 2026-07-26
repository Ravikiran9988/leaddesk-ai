export async function mockLeadDeskApi(page) {
  let mockLeads = [
    {
      _id: 'lead-1',
      name: 'Ava Johnson',
      email: 'ava@example.com',
      budget: 'Above $5000',
      message: 'Looking for enterprise AI lead qualification tool.',
      source: 'Website',
      category: 'Enterprise',
      status: 'New',
      tags: ['Hot', 'Enterprise'],
      assignedTo: { _id: 'user-1', name: 'John Sales', role: 'sales_rep' },
      aiAnalysis: {
        priority: 'High',
        leadScore: 92,
        confidenceScore: 95,
        summary: 'High value enterprise deal looking for immediate implementation.',
        category: 'Enterprise',
        sentiment: 'Positive',
        tags: ['Hot', 'Enterprise'],
        estimatedDealValue: 50000,
        recommendedNextAction: 'Schedule a demo call immediately.',
        analyzedAt: '2024-01-01T10:00:00.000Z',
      },
      followUpEmail: {
        subject: 'Follow-up regarding your Enterprise AI inquiry',
        body: 'Hi Ava,\n\nThank you for reaching out to AI LeadDesk...',
        generatedAt: '2024-01-01T11:00:00.000Z',
      },
      createdAt: '2024-01-01T10:00:00.000Z',
    },
    {
      _id: 'lead-2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      budget: '$1000-$5000',
      message: 'Need standard CRM integration.',
      source: 'LinkedIn',
      category: 'Mid-Market',
      status: 'Contacted',
      tags: ['Mid-Market'],
      createdAt: '2024-01-02T10:00:00.000Z',
    },
  ];

  let mockUsers = [
    { _id: 'user-1', name: 'John Sales', email: 'john@aileaddesk.com', role: 'sales_rep' },
    { _id: 'user-2', name: 'Sarah Admin', email: 'sarah@aileaddesk.com', role: 'admin' },
  ];

  // Auth routes
  await page.route('**/api/auth/login', async (route) => {
    const body = route.request().postDataJSON();
    const isValid = body?.email === 'admin@aileaddesk.com' && body?.password === 'Password123@';

    if (!isValid) {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Invalid email or password' }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          token: 'test-token',
          user: { id: '1', name: 'Admin', email: 'admin@aileaddesk.com', role: 'admin' },
        },
      }),
    });
  });

  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { user: { id: '1', name: 'Admin', email: 'admin@aileaddesk.com', role: 'admin' } },
      }),
    });
  });

  await page.route('**/api/auth/logout', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  // Users routes
  await page.route('**/api/users*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: mockUsers }),
    });
  });

  // AI routes
  await page.route('**/api/ai/leads/*/analyze', async (route) => {
    const url = route.request().url();
    const leadId = url.split('/ai/leads/')[1]?.split('/analyze')[0];
    const leadIndex = mockLeads.findIndex((l) => l._id === leadId);

    const updatedAnalysis = {
      priority: 'High',
      leadScore: 95,
      confidenceScore: 98,
      summary: 'AI Analysis: High urgency enterprise prospect.',
      category: 'Enterprise',
      sentiment: 'Positive',
      tags: ['Analyzed', 'High-Priority'],
      estimatedDealValue: 75000,
      recommendedNextAction: 'Send proposal within 24 hours.',
      analyzedAt: new Date().toISOString(),
    };

    if (leadIndex !== -1) {
      mockLeads[leadIndex] = { ...mockLeads[leadIndex], aiAnalysis: updatedAnalysis };
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: leadIndex !== -1 ? mockLeads[leadIndex] : { _id: leadId, aiAnalysis: updatedAnalysis },
      }),
    });
  });

  await page.route('**/api/ai/leads/*/follow-up-email', async (route) => {
    const url = route.request().url();
    const leadId = url.split('/ai/leads/')[1]?.split('/follow-up-email')[0];
    const leadIndex = mockLeads.findIndex((l) => l._id === leadId);

    const emailData = {
      subject: 'Follow-Up: Customized AI LeadDesk Solution',
      body: 'Dear Lead,\n\nFollowing up on our recent analysis...',
      generatedAt: new Date().toISOString(),
    };

    if (leadIndex !== -1) {
      mockLeads[leadIndex] = { ...mockLeads[leadIndex], followUpEmail: emailData };
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { lead: leadIndex !== -1 ? mockLeads[leadIndex] : { _id: leadId, followUpEmail: emailData } },
      }),
    });
  });

  await page.route('**/api/ai/chat', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          reply: 'High priority leads need follow-up today.',
          highlights: ['One high priority lead needs immediate attention.'],
          suggestedActions: ['Show high priority leads'],
        },
      }),
    });
  });

  // Notes route (POST /api/leads/*/notes)
  await page.route(/\/api\/leads\/[^\/]+\/notes$/, async (route) => {
    const url = route.request().url();
    const leadId = url.split('/api/leads/')[1]?.split('/notes')[0];
    const postData = route.request().postDataJSON() || {};
    const leadIndex = mockLeads.findIndex((l) => l._id === leadId);

    const newNote = {
      _id: `note-${Date.now()}`,
      content: postData.content || 'Test note content',
      createdBy: { name: 'Admin', role: 'admin' },
      createdAt: new Date().toISOString(),
    };

    if (leadIndex !== -1) {
      const existingNotes = mockLeads[leadIndex].notes || [];
      mockLeads[leadIndex] = {
        ...mockLeads[leadIndex],
        notes: [newNote, ...existingNotes],
      };
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: leadIndex !== -1 ? mockLeads[leadIndex] : { _id: leadId, notes: [newNote] },
      }),
    });
  });

  // Upload route (POST /api/leads/*/upload)
  await page.route(/\/api\/leads\/[^\/]+\/upload$/, async (route) => {
    const url = route.request().url();
    const leadId = url.split('/api/leads/')[1]?.split('/upload')[0];
    const leadIndex = mockLeads.findIndex((l) => l._id === leadId);

    const newAttachment = {
      _id: `file-${Date.now()}`,
      filename: 'sample_proposal.pdf',
      url: '#',
      uploadedAt: new Date().toISOString(),
    };

    if (leadIndex !== -1) {
      const existingAttachments = mockLeads[leadIndex].attachments || [];
      mockLeads[leadIndex] = {
        ...mockLeads[leadIndex],
        attachments: [newAttachment, ...existingAttachments],
      };
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: leadIndex !== -1 ? mockLeads[leadIndex] : { _id: leadId, attachments: [newAttachment] },
      }),
    });
  });

  // Analytics route
  await page.route('**/api/leads/analytics', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          cards: {
            totalLeads: mockLeads.length,
            todayLeads: 2,
            monthlyLeads: 5,
            highPriority: 1,
            wonDeals: 1,
            lostDeals: 0,
            estimatedRevenue: 50000,
            conversionRate: 50,
          },
          charts: {
            monthlyLeads: [{ month: 'Jan', count: 5 }],
            statusDistribution: [{ name: 'New', count: 5 }],
            sourceDistribution: [{ source: 'Website', count: 8 }],
            priorityDistribution: [{ priority: 'High', count: 3 }],
            revenue: [{ stage: 'Discovery', value: 1200 }],
            wonVsLost: [{ month: 'Jan', won: 2, lost: 1 }],
          },
        },
      }),
    });
  });

  // Leads Collection (GET list & POST create)
  await page.route(
    (url) => url.pathname === '/api/leads' || url.pathname === '/api/leads/',
    async (route) => {
    const method = route.request().method();
    const url = route.request().url();

    if (method === 'POST') {
      const postData = route.request().postDataJSON() || {};
      const newLead = {
        _id: `lead-${Date.now()}`,
        name: postData.name || 'New Lead',
        email: postData.email || 'newlead@example.com',
        budget: postData.budget || '$10,000',
        message: postData.message || 'Test message',
        source: postData.source || 'Website',
        category: postData.category || 'General',
        status: 'New',
        tags: postData.tags || [],
        createdAt: new Date().toISOString(),
      };
      mockLeads.unshift(newLead);

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: newLead }),
      });
      return;
    }

    if (method === 'GET') {
      const searchMatch = url.match(/[?&]search=([^&]*)/);
      const searchQuery = searchMatch ? decodeURIComponent(searchMatch[1]).toLowerCase() : '';

      const statusMatch = url.match(/[?&]status=([^&]*)/);
      const statusQuery = statusMatch ? decodeURIComponent(statusMatch[1]).toLowerCase() : '';

      let filtered = mockLeads;
      if (searchQuery) {
        filtered = filtered.filter(
          (l) => l.name.toLowerCase().includes(searchQuery) || l.email.toLowerCase().includes(searchQuery)
        );
      }
      if (statusQuery) {
        filtered = filtered.filter((l) => l.status.toLowerCase() === statusQuery);
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            leads: filtered,
            stats: {
              total: filtered.length,
              New: filtered.filter((l) => l.status === 'New').length,
              Contacted: filtered.filter((l) => l.status === 'Contacted').length,
              Qualified: 0,
              Proposal: 0,
              Negotiation: 0,
              Won: 0,
              Lost: 0,
            },
            pagination: { page: 1, totalPages: 1, total: filtered.length },
          },
        }),
      });
      return;
    }

    await route.continue();
  });

  // Single Lead Item routes (GET, PATCH, DELETE /api/leads/:id)
  await page.route(/\/api\/leads\/[^\/]+$/, async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    const leadId = url.split('/api/leads/')[1]?.split('?')[0];
    const index = mockLeads.findIndex((l) => l._id === leadId);

    if (method === 'GET') {
      if (index !== -1) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: mockLeads[index] }),
        });
      } else {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'Lead not found' }),
        });
      }
      return;
    }

    if (method === 'PATCH') {
      const patchData = route.request().postDataJSON() || {};
      if (index !== -1) {
        mockLeads[index] = { ...mockLeads[index], ...patchData };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: mockLeads[index] }),
        });
      } else {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'Lead not found' }),
        });
      }
      return;
    }

    if (method === 'DELETE') {
      if (index !== -1) {
        mockLeads.splice(index, 1);
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Lead deleted' }),
      });
      return;
    }

    await route.continue();
  });
}
