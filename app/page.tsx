import HeroSection from '@/components/home/HeroSection'
import FeaturesSection from '@/components/home/FeaturesSection'
// import ExpertPanelSection from '@/components/home/ExpertPanelSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import VolunteersSection from '@/components/home/VolunteersSection'

import CTASection from '@/components/home/CTASection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      {/* <ExpertPanelSection /> */}
      <HowItWorksSection />
      <VolunteersSection />
      <CTASection />
    </>
  )
}
