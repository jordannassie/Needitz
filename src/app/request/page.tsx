import { Header } from "@/components/Header";
import { RequestForm } from "@/components/RequestForm";

export const metadata = {
  title: "Submit a Request — Needitz",
};

export default function RequestPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <RequestForm />
      </main>
    </>
  );
}
