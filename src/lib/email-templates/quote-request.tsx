import React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  email?: string
  phone?: string
  service?: string
  details?: string
  locale?: string
  pageUrl?: string
}

const Row = ({ label, value }: { label: string; value: string | undefined }) =>
  value ? (
    <Section style={row}>
      <Text style={rowLabel}>{label}</Text>
      <Text style={rowValue}>{value}</Text>
    </Section>
  ) : null

const Email = ({ name, email, phone, service, details, locale, pageUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`New quote request${name ? ` from ${name}` : ''}${service ? ` — ${service}` : ''}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={kicker}>OKAAB — Performance. Vision. Speed.</Text>
        <Heading style={h1}>New quote request</Heading>
        <Text style={intro}>
          A new project request was submitted through the website form.
        </Text>
        <Hr style={hr} />
        <Row label="Name" value={name} />
        <Row label="Email" value={email} />
        <Row label="Phone" value={phone} />
        <Row label="Service" value={service} />
        <Row label="Details" value={details} />
        <Hr style={hr} />
        <Row label="Language" value={locale} />
        <Row label="Page" value={pageUrl} />
        <Text style={footer}>Sent automatically from okaab.org</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `New quote request — ${data['service'] || 'Project'}${data['name'] ? ` (${data['name']})` : ''}`,
  displayName: 'Quote request (sales)',
  to: 'sales@okaab.org',
  previewData: {
    name: 'Mohamed Shaaban',
    email: 'mohamed@example.com',
    phone: '+201000000000',
    service: 'E-commerce store',
    details: 'We need a fast store with payment integration, launch in 6 weeks.',
    locale: 'ar-EG',
    pageUrl: 'https://okaab.org/',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '28px 26px', maxWidth: '600px' }
const kicker = {
  fontSize: '12px',
  letterSpacing: '1px',
  textTransform: 'uppercase' as const,
  color: '#8a8a8a',
  margin: '0 0 6px',
}
const h1 = { fontSize: '24px', color: '#111111', margin: '0 0 8px' }
const intro = { fontSize: '15px', color: '#444444', margin: '0' }
const hr = { borderColor: '#e6e6e6', margin: '20px 0' }
const row = { margin: '0 0 12px' }
const rowLabel = {
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  color: '#8a8a8a',
  margin: '0 0 2px',
}
const rowValue = {
  fontSize: '15px',
  color: '#111111',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
}
const footer = { fontSize: '12px', color: '#8a8a8a', margin: '16px 0 0' }
