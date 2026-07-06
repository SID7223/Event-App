import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const TermsScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Terms & Conditions</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.lastUpdated}>Last updated: July 6, 2026</Text>

          <Section title="1. Acceptance of Terms">
            By creating an account or using EventApp ("the App"), you agree to
            be bound by these Terms & Conditions. If you do not agree, please do
            not use the App.
          </Section>

          <Section title="2. Description of Service">
            EventApp is a social event discovery and planning platform that
            allows users to discover, create, RSVP to, and share events. The App
            provides personalized event recommendations based on your
            preferences, location, and interests.
          </Section>

          <Section title="3. User Accounts">
            You are responsible for maintaining the confidentiality of your
            account credentials. You must provide accurate, current, and
            complete information during registration. You must be at least 13
            years of age to use the App.
          </Section>

          <Section title="4. Information We Collect">
            We collect the following information when you create an account and
            use the App:{'\n\n'}
            • First and last name{'\n'}
            • Email address{'\n'}
            • Phone number{'\n'}
            • Password (stored securely, encrypted){'\n'}
            • Location data (to show nearby events){'\n'}
            • Event preferences and interests (vibe quiz responses){'\n'}
            • Events you create, save, or attend{'\n'}
            • Device information and app usage data
          </Section>

          <Section title="5. How We Use Your Information">
            We use your information to:{'\n\n'}
            • Create and manage your account{'\n'}
            • Provide personalized event recommendations{'\n'}
            • Send event-related notifications and updates{'\n'}
            • Improve the App's features and user experience{'\n'}
            • Detect and prevent fraudulent or unauthorized activity{'\n'}
            • Communicate with you about service-related matters
          </Section>

          <Section title="6. Data Sharing">
            We do not sell your personal information to third parties. We may
            share your data only in the following circumstances:{'\n\n'}
            • With your explicit consent{'\n'}
            • To comply with legal obligations{'\n'}
            • To protect the rights and safety of users{'\n'}
            • With service providers who help operate the App (e.g., cloud
            hosting, push notifications)
          </Section>

          <Section title="7. Data Security">
            We implement industry-standard security measures to protect your
            data, including encryption of passwords and secure data transmission
            via HTTPS. However, no method of electronic storage is 100%
            secure. We cannot guarantee absolute security.
          </Section>

          <Section title="8. Your Rights">
            You have the right to:{'\n\n'}
            • Access the personal data we hold about you{'\n'}
            • Request correction of inaccurate data{'\n'}
            • Request deletion of your account and associated data{'\n'}
            • Opt out of promotional communications{'\n'}
            • Withdraw consent at any time where we rely on consent to process
            your data
          </Section>

          <Section title="9. Third-Party Services">
            The App integrates with the following third-party services:{'\n\n'}
            • Google Maps / Location Services – for mapping and location-based
            features{'\n'}
            • Expo Notifications – for push notifications{'\n'}
            • Expo Splash Screen – for app loading experience{'\n\n'}
            These services have their own privacy policies governing data
            handling.
          </Section>

          <Section title="10. User Conduct">
            You agree not to:{'\n\n'}
            • Use the App for any unlawful purpose{'\n'}
            • Harass, abuse, or harm other users{'\n'}
            • Create fake or misleading event listings{'\n'}
            • Attempt to gain unauthorized access to the App's systems{'\n'}
            • Interfere with the proper functioning of the App
          </Section>

          <Section title="11. Limitation of Liability">
            EventApp and its operators shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages arising from
            your use of the App. The App is provided on an "as is" and "as
            available" basis.
          </Section>

          <Section title="12. Changes to Terms">
            We reserve the right to modify these Terms at any time. Changes
            will be effective immediately upon posting. Your continued use of
            the App after changes constitutes acceptance of the new Terms.
            We will notify you of material changes via email or in-app notice.
          </Section>

          <Section title="13. Contact Us">
            If you have questions about these Terms, please contact us at:{'\n\n'}
            Email: support@corlify.com{'\n'}
            App: EventApp by Corlify{'\n'}
            Package: com.corlify.eventapp
          </Section>

          <View style={styles.footer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionBody}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E43414',
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
  },
  footer: {
    height: 40,
  },
});

export default TermsScreen;
