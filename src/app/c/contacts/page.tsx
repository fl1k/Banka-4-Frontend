'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useBreadcrumb } from '@/context/BreadcrumbContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import FilterBar from '@/components/filters/FilterBar';
import { DataTable } from '@/components/dataTable/DataTable';
import useTablePageParams from '@/hooks/useTablePageParams';
import {
  createContactsColumns,
  ContactResponseDto,
} from '@/ui/dataTables/contacts/contactsColumns';
import { mockContacts } from '@/mocks/contacts';
import ContactForm, {
  ContactFormAction,
} from '@/components/contacts/contact-form';
import { DeleteDialog } from '@/components/DeleteDialog';

interface ContactFilter {
  name: string;
  accountNumber: string;
}

const contactFilterKeyToName = (key: keyof ContactFilter): string => {
  switch (key) {
    case 'name':
      return 'Name';
    case 'accountNumber':
      return 'Account Number';
  }
};

const ContactsPage: React.FC = () => {
  const { page, pageSize, setPage, setPageSize } = useTablePageParams(
    'contacts',
    {
      pageSize: 8,
      page: 0,
    }
  );
  const [searchFilter, setSearchFilter] = useState<ContactFilter>({
    name: '',
    accountNumber: '',
  });
  const [showClientForm, setShowClientForm] = useState(false);
  const [selectedContact, setSelectedContact] =
    useState<ContactResponseDto | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { dispatch } = useBreadcrumb();
  useEffect(() => {
    dispatch({
      type: 'SET_BREADCRUMB',
      items: [
        { title: 'Home', url: '/' },
        { title: 'Contacts', url: '/contacts' },
        { title: 'Overview' },
      ],
    });
  }, [dispatch]);

  // Koristimo mock podatke
  const data = mockContacts;
  const totalElements = data?.totalElements || 0;
  const pageCount = Math.ceil(totalElements / pageSize);

  // Callback for edit
  const handleEdit = (contact: ContactResponseDto) => {
    setSelectedContact(contact);
    setShowClientForm(true);
  };

  // Callback for delete
  const handleDelete = (contact: ContactResponseDto) => {
    setSelectedContact(contact);
    setShowDeleteDialog(true);
  };

  const handleContactSubmit = (action: ContactFormAction) => {
    if (action.update) {
      console.log('Update contact with data:', action.data);
    } else {
      console.log('Create new contact with data:', action.data);
    }
    setShowClientForm(false);
    setSelectedContact(null);
  };

  const handleContactCancel = () => {
    setShowClientForm(false);
    setSelectedContact(null);
  };

  const columns = createContactsColumns(handleEdit, handleDelete);

  return (
    <>
      <div className="p-8">
        <Card className="max-w-[900px] mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Contacts</h1>
                <p className="text-sm text-zinc-500">
                  Manage your contacts. Use the actions to edit or delete
                  contacts.
                </p>
              </div>
              <Button
                onClick={() => {
                  setSelectedContact(null);
                  setShowClientForm(true);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <FilterBar<ContactFilter>
              filterKeyToName={contactFilterKeyToName}
              onSearch={(filter) => {
                setPage(0);
                setSearchFilter(filter);
              }}
              filter={searchFilter}
            />
          </CardHeader>
          <CardContent className="rounded-lg overflow-hidden">
            <DataTable
              onRowClick={() => {}}
              columns={columns}
              data={data?.content ?? []}
              isLoading={false}
              pageCount={pageCount}
              pagination={{ page, pageSize }}
              onPaginationChange={(newPagination) => {
                setPage(newPagination.page);
                setPageSize(newPagination.pageSize);
              }}
            />
          </CardContent>
        </Card>
      </div>

      {showClientForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-black rounded-lg p-6 shadow-2xl">
            <ContactForm
              contact={selectedContact}
              onSubmit={handleContactSubmit}
              onCancel={handleContactCancel}
            />
          </div>
        </div>
      )}

      {showDeleteDialog && selectedContact && (
        <DeleteDialog
          open={showDeleteDialog}
          itemName={selectedContact.name}
          onConfirm={() => {
            console.log('Deleting contact', selectedContact.id);
            // TODO: Call delete API method here
            setShowDeleteDialog(false);
            setSelectedContact(null);
          }}
          onCancel={() => {
            setShowDeleteDialog(false);
            setSelectedContact(null);
          }}
        />
      )}
    </>
  );
};

export default ContactsPage;
