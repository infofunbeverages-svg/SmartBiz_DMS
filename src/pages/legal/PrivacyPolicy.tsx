import React from 'react';
import LegalLayout, { LegalSection } from './LegalLayout';

// NOTE: draft text — have a lawyer review before publishing / Google Play submission.
const sections: LegalSection[] = [
  { title: 'Introduction', paras: [
    'SmartBiz DMS ("SmartBiz", "we") is a distributor management and sales force automation platform for authorised distributors, agencies, sales managers and sales representatives.',
    'This policy explains what information the web application and the SmartBiz SFA Android app process, why, and the choices available to you.'] },
  { title: 'Scope', bullets: [
    'The SmartBiz DMS web application.', 'The SmartBiz SFA Android mobile application.',
    'Backend services and APIs, and approved synchronisation with enterprise systems (for example ERP / BMS).'],
    paras: ['The platform is intended for authorised business users only, not for general consumers or children.'] },
  { title: 'Information We Collect', bullets: [
    'Account: name, user ID, business email, contact number, role, assigned company, agency, region, area and route.',
    'Location: GPS coordinates and timestamps during duty hours, outlet visits and transactions.',
    'Attendance and field activity: duty start/end, odometer readings, selfie or QR verification, productive / unproductive visits, remarks.',
    'Business records: shops/outlets, bookings, orders, invoices, returns, free issues, payments, outstanding balances, targets.',
    'Device and technical data: OS and app version, device identifier, connectivity status, error logs and timestamps.',
    'Camera and files: only when a feature needs it, such as duty selfie, QR scan or shop photo.'] },
  { title: 'How We Use Information', bullets: [
    'Authenticating users and enforcing role-based access.',
    'Managing agencies, routes, shops, stock, bookings, deliveries and billing.',
    'Recording attendance and verifying outlet visits and routes.',
    'Producing sales, stock, outstanding and performance reports.',
    'Synchronising authorised records with enterprise systems.',
    'Preventing misuse, investigating errors and meeting legal and accounting obligations.'] },
  { title: 'Location Tracking and Transparency', paras: [
    'Location is collected only for authorised field operations. Before location permission is requested, the app explains why it is needed, including any background location while duty is active.',
    'Tracking starts when a user starts duty and stops when duty ends. Location is visible only to supervisors and administrators with appropriate access, is never sold, and is never used for advertising.',
    'You can manage permissions in your Android settings; turning location off may disable attendance verification, visit check-ins and route tracking.'] },
  { title: 'Information Sharing', bullets: [
    'Authorised internal personnel (managers, administrators, finance) according to role.',
    'Infrastructure, hosting and mapping providers acting on our instructions.',
    'Approved enterprise systems integrated with SmartBiz.',
    'Authorities where required by law.'],
    paras: ['We do not sell personal information or precise location data.'] },
  { title: 'Data Storage and Security', bullets: [
    'Role-based access control and row-level security on the database.',
    'Encrypted communication (HTTPS/TLS).', 'Audit logs and monitoring.', 'Backups and recovery.'],
    paras: ['No system is perfectly secure. Users must protect their credentials and report suspected unauthorised access immediately.'] },
  { title: 'Data Retention', paras: [
    'Information is kept only as long as needed for business, contractual, accounting and legal purposes. Location, attendance and technical logs follow our retention schedule and are then deleted or anonymised.'] },
  { title: 'Account Management and Deletion', paras: [
    'Accounts are managed by your organisation\'s administrators. You may request access, correction or deletion of eligible personal data through the contact below. Business transaction records that must lawfully be retained may be restricted rather than deleted.'] },
  { title: 'Your Rights and Choices', bullets: [
    'Request information about your personal data.', 'Request correction of inaccurate data.',
    'Request deletion of eligible data.', 'Manage device permissions.', 'Raise privacy concerns.'] },
  { title: 'Third-Party Services', paras: [
    'We may use approved third-party services for hosting, authentication, mapping and diagnostics. These providers process data only to deliver their services and are subject to their own privacy terms.'] },
  { title: "Children's Privacy", paras: ['The platform is not intended for anyone under 18 and does not knowingly collect information from children.'] },
  { title: 'Changes to This Policy', paras: ['We may update this policy as features or laws change. Updated versions are published here with a new revision date.'] },
  { title: 'Contact Information', paras: ['Application: SmartBiz DMS / SmartBiz SFA', 'info.smartbizsoftwares@gmail.com', 'Address: Kananvila, Horana, Srilanka'] },
];

const PrivacyPolicy: React.FC = () => (
  <LegalLayout badge="SmartBiz DMS & SFA" title="Privacy Policy"
    subtitle="How SmartBiz processes information for authorised business users."
    effective="November 7, 2026" updated="November 7, 2026" sections={sections} />
);
export default PrivacyPolicy;
