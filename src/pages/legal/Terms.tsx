import React from 'react';
import LegalLayout, { LegalSection } from './LegalLayout';

// NOTE: draft text — have a lawyer review before publishing.
const sections: LegalSection[] = [
  { title: 'Acceptance of Terms', paras: ['By signing in to SmartBiz DMS or the SmartBiz SFA app you agree to these terms. If you do not agree, do not use the platform.'] },
  { title: 'Authorised Use', bullets: [
    'Accounts are issued by your organisation and are personal; do not share credentials.',
    'Use the platform only for legitimate business activity within your assigned role, agency and route.',
    'Do not attempt to access data outside your permissions or interfere with the system.'] },
  { title: 'Business Data and Accuracy', paras: [
    'You are responsible for the accuracy of bookings, invoices, returns, stock and payment entries you create. Records may be audited and are retained as required for accounting and legal purposes.'] },
  { title: 'Duty, Attendance and Location', paras: [
    'Where duty tracking is enabled you agree to start and end duty honestly, provide the required verification (selfie or QR) and odometer readings, and allow location tracking during duty as described in the Privacy Policy.'] },
  { title: 'Orders, Stock and Credit', bullets: [
    'Bookings and delivery orders follow the order flow configured for your agency.',
    'Credit limits, outstanding balances and approvals are enforced as configured by your organisation.',
    'Stock figures are as of the last synchronisation.'] },
  { title: 'Availability and Offline Use', paras: ['The mobile app may work offline and synchronise later. We do not guarantee uninterrupted availability and may perform maintenance or updates at any time.'] },
  { title: 'Intellectual Property', paras: ['The software, design and documentation remain the property of SmartBiz and its licensors. You may not copy, reverse engineer or resell any part of it.'] },
  { title: 'Suspension and Termination', paras: ['Access may be suspended or ended by your organisation or by us for misuse, security reasons or end of employment or contract.'] },
  { title: 'Limitation of Liability', paras: ['To the extent permitted by law, SmartBiz is not liable for indirect or consequential loss arising from use of the platform.'] },
  { title: 'Governing Law', paras: ['These terms are governed by the laws of Sri Lanka.'] },
  { title: 'Changes and Contact', paras: ['We may update these terms; continued use means acceptance. Questions: support@smartbiz.lk'] },
];

const Terms: React.FC = () => (
  <LegalLayout badge="SmartBiz DMS & SFA" title="Terms & Conditions"
    subtitle="The rules for using the SmartBiz platform."
    effective="November 7, 2026" updated="November 7, 2026" sections={sections} />
);
export default Terms;
