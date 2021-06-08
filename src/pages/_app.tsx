import '../styles/globals.css'
import Providers from "../components/_provider";
import styled from "styled-components";
import type { AppProps } from 'next/app'

const CenteredPage = styled.div`
    width: 800px;
    min-height: 100vh;
    margin: 0 auto;
    max-width: 88vw;
`;

function MyApp({ Component, pageProps }: AppProps) {
  return <Providers>
    <CenteredPage>
        <Component {...pageProps} />
    </CenteredPage>
  </Providers>
}
export default MyApp
