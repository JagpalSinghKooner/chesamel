// The contact and newsletter forms' fields and wording, copied from the live
// HubSpot forms (issue #11): same fields, order, required flags, consent text,
// validation messages and success messages. HubSpot names are kept as `name`
// so #48 can post them as they are.
//
// Live hides each label and shows the placeholder in the field; the label is
// still read out to screen readers.
import { legalLinks } from './site';

export interface FormField {
  name: string;
  label: string;
  placeholder: string;
  type: 'email' | 'text' | 'tel';
  autocomplete: string;
  required: boolean;
  // Spans both columns from the first breakpoint, as Email does on Contact.
  wide?: boolean;
}

// One piece of consent text; `link` is a word in it that links to a policy.
export interface ConsentText {
  text: string;
  link?: { word: string; href: string };
}

export interface FormDefinition {
  // The live HubSpot form's GUID, for #48.
  hubspotFormId: string;
  fields: FormField[];
  // The optional communications checkbox, and the notes shown under it.
  consent: { name: string; label: ConsentText; notes: ConsentText[] };
  submitLabel: string;
  // Paragraphs shown in place of the form once it is sent.
  success: string[];
}

const policy = (label: string) => legalLinks.find((l) => l.label === label)!.href;

export const hubspotPortalId = '7886724';

// HubSpot's own wording for each validation failure.
export const formMessages = {
  required: 'Please complete this required field.',
  email: 'Email must be formatted correctly.',
  phone: 'A valid phone number may only contain numbers, +()-. or x',
  summary: 'Please complete all required fields.',
};

const field = (name: string, label: string, placeholder: string, type: FormField['type'], autocomplete: string, required: boolean, wide = false): FormField => ({
  name,
  label,
  placeholder,
  type,
  autocomplete,
  required,
  wide,
});

const consentName = 'LEGAL_CONSENT.subscription_type_9590014';

export const contactForm: FormDefinition = {
  hubspotFormId: 'f3fceaba-faed-429b-a6e7-763ac627dd5f',
  fields: [
    field('email', 'Email', 'Email Address', 'email', 'email', true, true),
    field('firstname', 'First name', 'First Name', 'text', 'given-name', true),
    field('lastname', 'Last name', 'Last Name', 'text', 'family-name', false),
    field('phone', 'Phone number', 'Phone Number', 'tel', 'tel', true),
    field('company', 'Company name', 'Company Name', 'text', 'organization', true),
    field('jobtitle', 'Job Title', 'Job Title', 'text', 'organization-title', true),
    field('enquiry', 'Enquiry', 'Enquiry', 'text', 'off', true),
  ],
  consent: {
    name: consentName,
    // Live links the old 2021 policy PDFs, which now return 404; these are the
    // current ones the footer links (#6).
    label: { text: 'I agree to Chesamel Group Ltd\'s Terms & Conditions.', link: { word: 'Terms & Conditions', href: policy('Terms and Conditions') } },
    notes: [
      {
        text: 'For more information on how to unsubscribe, our privacy practices, and how we are committed to protecting and respecting your privacy, please review our Privacy Policy.',
        link: { word: 'Privacy Policy', href: policy('Privacy & Cookies Policy') },
      },
      { text: 'By clicking submit below, you consent to allow Chesamel Group Ltd to store and process the personal information submitted above to process your request.' },
    ],
  },
  submitLabel: 'Submit',
  success: ['Thank you for submitting your details.', 'We will reach out to you shortly so please keep an eye on your inbox.'],
};

export const newsletterForm: FormDefinition = {
  hubspotFormId: '3f735cce-b536-4977-844b-11765c187a21',
  fields: [
    field('email', 'Email', 'Email Address', 'email', 'email', true),
    field('firstname', 'First name', 'First Name', 'text', 'given-name', true),
    field('lastname', 'Last name', 'Last Name', 'text', 'family-name', true),
    field('phone', 'Phone number', 'Phone Number', 'tel', 'tel', true),
  ],
  consent: {
    name: consentName,
    label: { text: 'I agree to receive other communications from Chesamel Group Ltd.' },
    // Live shows the checkbox first and these notes under it, with Privacy
    // Policy unlinked.
    notes: [
      {
        text: 'chesamel.com is committed to protecting and respecting your privacy, and we’ll only use your personal information to administer your account and to provide the products and services you requested from us. From time to time, we would like to contact you about our products and services, as well as other content that may be of interest to you. If you consent to us contacting you for this purpose, please tick below to say how you would like us to contact you:',
      },
      {
        text: 'You may unsubscribe from these communications at any time. For more information on how to unsubscribe, our privacy practices, and how we are committed to protecting and respecting your privacy, please review our Privacy Policy.',
      },
      { text: 'By clicking submit below, you consent to allow chesamel.com to store and process the personal information submitted above to provide you the content requested.' },
    ],
  },
  submitLabel: 'Submit',
  success: ['Thanks for submitting the form.'],
};
