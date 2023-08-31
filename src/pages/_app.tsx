import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "bootstrap/dist/css/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
    <Head>
      <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests" /> 
    </Head>
      <Component {...pageProps} />
      <ToastContainer />
    </>
  );
}
