/**
 * ADMIN - Composant PDF du brief (react-pdf/renderer)
 * @ai-context Document officiel envoyé au tailleur, signé par client + tailleur
 */

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import type { OrderRequest } from '@/lib/services/adminConcierge'

// Palette Signare
const GOLD = '#D4AF37'
const BLACK = '#0A0A0A'
const GRAY = '#6B7280'
const LIGHT_GRAY = '#F3F4F6'
const BORDER = '#E5E7EB'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: BLACK,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: GOLD,
  },
  brand: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: GOLD,
    letterSpacing: 3,
  },
  brandSub: {
    fontSize: 9,
    color: GRAY,
    marginTop: 2,
    letterSpacing: 1,
  },
  refBlock: {
    alignItems: 'flex-end',
  },
  refLabel: {
    fontSize: 8,
    color: GRAY,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  refValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
    marginTop: 2,
  },
  dateValue: {
    fontSize: 9,
    color: GRAY,
    marginTop: 4,
  },

  // Sections
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  section: {
    marginBottom: 24,
  },

  // Grid de champs
  grid2: {
    flexDirection: 'row',
    gap: 16,
  },
  field: {
    flex: 1,
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 8,
    color: GRAY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  fieldValue: {
    fontSize: 10,
    color: BLACK,
    fontFamily: 'Helvetica-Bold',
  },
  fieldValueNormal: {
    fontSize: 10,
    color: BLACK,
  },

  // Badges
  badgeUrgent: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  badgeUrgentText: {
    fontSize: 9,
    color: '#DC2626',
    fontFamily: 'Helvetica-Bold',
  },

  // Notes / descriptions
  notesBox: {
    backgroundColor: LIGHT_GRAY,
    borderRadius: 6,
    padding: 12,
    marginTop: 4,
  },
  notesText: {
    fontSize: 10,
    color: BLACK,
    lineHeight: 1.6,
  },

  // Mesures
  measurementsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 6,
    padding: 8,
    gap: 8,
  },
  measurementsBadgeWarn: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
  },
  measurementsText: {
    fontSize: 9,
    color: '#166534',
  },
  measurementsTextWarn: {
    color: '#92400E',
  },

  // Tailleur
  tailorCard: {
    backgroundColor: LIGHT_GRAY,
    borderRadius: 8,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
  },
  tailorName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
    marginBottom: 3,
  },
  tailorSpecialty: {
    fontSize: 9,
    color: GRAY,
    marginBottom: 6,
  },
  tailorPhone: {
    fontSize: 9,
    color: GRAY,
  },

  // Signatures
  signaturesRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 8,
  },
  signatureBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  signatureLabel: {
    fontSize: 9,
    color: GRAY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  signatureImage: {
    width: 160,
    height: 64,
    objectFit: 'contain',
  },
  signatureLine: {
    width: 160,
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    marginBottom: 4,
  },
  signatureDate: {
    fontSize: 8,
    color: GRAY,
    marginTop: 6,
  },
  signaturePending: {
    fontSize: 9,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 24,
    marginBottom: 24,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#9CA3AF',
  },
  footerGold: {
    fontSize: 8,
    color: GOLD,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
  },
})

function formatDate(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatCurrency(amount?: number): string {
  if (!amount) return '—'
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}

interface Props {
  request: OrderRequest
}

export default function BriefDocument({ request }: Props) {
  const createdDate = formatDate(request.createdAt)
  const deadlineDate = formatDate(request.deadline)
  const briefSentDate = formatDate(request.briefSentAt)

  return (
    <Document
      title={`Brief Signare — ${request.ref}`}
      author="Signare Conciergerie"
      subject="Brief de confection sur mesure"
      creator="Signare"
    >
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>SIGNARE</Text>
            <Text style={styles.brandSub}>Conciergerie sur mesure</Text>
          </View>
          <View style={styles.refBlock}>
            <Text style={styles.refLabel}>Référence</Text>
            <Text style={styles.refValue}>{request.ref}</Text>
            <Text style={styles.dateValue}>Émis le {createdDate}</Text>
          </View>
        </View>

        {/* ── Urgence ── */}
        {request.priority === 'urgent' && (
          <View style={styles.badgeUrgent}>
            <Text style={styles.badgeUrgentText}>URGENT — Délai serré</Text>
          </View>
        )}

        {/* ── Détails de la tenue ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tenue commandée</Text>
          <View style={styles.grid2}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Type de vêtement</Text>
              <Text style={styles.fieldValue}>{request.garment_type}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Tissu</Text>
              <Text style={styles.fieldValue}>{request.fabric_type ?? '—'}</Text>
            </View>
          </View>
          <View style={styles.grid2}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Occasion</Text>
              <Text style={styles.fieldValueNormal}>{request.occasion}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Couleur / Teinte</Text>
              <Text style={styles.fieldValueNormal}>{request.color ?? '—'}</Text>
            </View>
          </View>
          <View style={styles.grid2}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Budget client</Text>
              <Text style={styles.fieldValue}>{formatCurrency(request.budget)}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Date de livraison souhaitée</Text>
              <Text style={styles.fieldValue}>{deadlineDate}</Text>
            </View>
          </View>
          {request.notes && (
            <View>
              <Text style={styles.fieldLabel}>Notes client</Text>
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>{request.notes}</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Instructions du brief ── */}
        {request.briefNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions de la conciergerie</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{request.briefNotes}</Text>
            </View>
            <Text style={[styles.fieldLabel, { marginTop: 6 }]}>
              Brief émis le {briefSentDate}
            </Text>
          </View>
        )}

        {/* ── Mesures ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mesures</Text>
          <View style={[
            styles.measurementsBadge,
            !request.hasMeasurements && styles.measurementsBadgeWarn,
          ]}>
            <Text style={[
              styles.measurementsText,
              !request.hasMeasurements && styles.measurementsTextWarn,
            ]}>
              {request.hasMeasurements
                ? `Mesures validées — Ref. ${request.measurementsRef ?? 'N/A'}`
                : 'Mesures non disponibles — à collecter avant production'}
            </Text>
          </View>
        </View>

        {/* ── Tailleur assigné ── */}
        {request.targetTailor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tailleur assigné</Text>
            <View style={styles.tailorCard}>
              <Text style={styles.tailorName}>{request.targetTailor.name}</Text>
              <Text style={styles.tailorSpecialty}>{request.targetTailor.specialty}</Text>
              <Text style={styles.tailorPhone}>Contact interne : {request.targetTailor.phone}</Text>
            </View>
          </View>
        )}

        {/* ── Signatures ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Signatures</Text>
          <View style={styles.signaturesRow}>
            {/* Client */}
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Conciergerie (pour le client)</Text>
              {request.clientSignature ? (
                <>
                  <Image
                    src={request.clientSignature}
                    style={styles.signatureImage}
                  />
                  <Text style={styles.signatureDate}>
                    Signé le {formatDate(request.clientSignedAt)}
                  </Text>
                </>
              ) : (
                <>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signaturePending}>En attente de signature</Text>
                </>
              )}
            </View>

            {/* Tailleur */}
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Tailleur</Text>
              {request.tailorSignature ? (
                <>
                  <Image
                    src={request.tailorSignature}
                    style={styles.signatureImage}
                  />
                  <Text style={styles.signatureDate}>
                    Signé le {formatDate(request.tailorSignedAt)}
                  </Text>
                </>
              ) : (
                <>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signaturePending}>En attente de signature</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Signare — Document confidentiel — {request.ref}
          </Text>
          <Text style={styles.footerGold}>SIGNARE</Text>
          <Text style={styles.footerText}>
            Émis le {createdDate}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
