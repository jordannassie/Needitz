import { Header } from "@/components/Header";
import { RequestForm } from "@/components/RequestForm";
import { HomeContent } from "@/components/HomeContent";
import { PromoImage } from "@/components/PromoImage";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content">
        <RequestForm />
      </main>
      <HomeContent />
      <PromoImage />
      <SiteFooter />
    </>
  );
}
