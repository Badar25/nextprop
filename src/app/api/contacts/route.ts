import { NextResponse } from 'next/server';
import { getContacts, fetchWithErrorHandling } from '@/lib/enhancedApi';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('forceRefresh') === 'true';
    
    console.log('Fetching contacts with forceRefresh:', forceRefresh);
    const response = await fetchWithErrorHandling(() => getContacts({}, undefined, undefined, forceRefresh));
    
    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: response.status || 500 }
      );
    }

    // Process contacts to ensure proper name handling
    const processedData = {
      ...response,
      contacts: (response.contacts || []).map((contact: any) => {
        let name = contact.contactName || null;
        if (!name && contact.firstName && contact.lastName) {
          name = `${contact.firstName} ${contact.lastName}`.trim();
        } else if (!name && contact.firstName) {
          name = contact.firstName;
        } else if (!name && contact.lastName) {
          name = contact.lastName;
        }

        return {
          ...contact,
          name: name || contact.name || null
        };
      })
    };
    
    return NextResponse.json(processedData);
  } catch (error: any) {
    console.error('Error in contacts API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
} 