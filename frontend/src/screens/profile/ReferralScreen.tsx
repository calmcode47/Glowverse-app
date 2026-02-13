import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../../theme/themeContext";
import ProfessionalBackground from "../../components/animated/ProfessionalBackground";
import * as RefAPI from "../../services/api/referrals.api";
import ShareCard from "../../components/referral/ShareCard";
import { deepLinkingService } from "../../services/deepLinking.service";
import ReferralStats from "../../components/referral/ReferralStats";

export default function ReferralScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [data, setData] = React.useState<RefAPI.ReferralData | null>(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    (async () => {
      try {
        const d = await RefAPI.getMyReferrals();
        setData(d);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <ProfessionalBackground variant="subtle" />
      {data ? (
        <>
          <ShareCard code={data.code} link={deepLinkingService.createUniversalLink("referral", { code: data.code })} />
          <ReferralStats total={data.total} earned={data.earned} pending={data.pending} friends={data.friends} />
          <View style={styles.how}>
            <Text style={styles.title}>How It Works</Text>
            <Text style={styles.line}>1. Share your code</Text>
            <Text style={styles.line}>2. Friend signs up with code</Text>
            <Text style={styles.line}>3. Both get rewards</Text>
          </View>
        </>
      ) : !loading ? (
        <Text style={{ color: theme.colors.text.secondary }}>No referral data</Text>
      ) : null}
    </ScrollView>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
    how: { borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated, borderRadius: 12, padding: 12, gap: 4 },
    title: { color: theme.colors.text.primary, fontWeight: "900" },
    line: { color: theme.colors.text.secondary }
  });
}
