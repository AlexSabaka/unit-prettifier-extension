/*global chrome*/
import { InlineMath, BlockMath } from "react-katex";
import Expander from './../components/Expander';
import CopyrightInfo from './../components/CopyrightInfo';

import './About.css';
import "katex/dist/katex.min.css";
import BuyCoffeeLinkButton from "../components/BuyCoffeeLinkButton";

export default function About() {
  return (
    <div className='About'>
      <h2>About</h2>
      <p>This extension helps you seamlessly convert measurements from one unit to another. Currently those which relation are linear.</p>
      <p>Linear means that measurements converting law obeys formula:
        <BlockMath>{'y = kx - b'}</BlockMath>
        Where: <br />
        <> <strong>x</strong> - original unit </> <br />
        <> <strong>y</strong> - input unit </> <br />
        <> <strong>k</strong> - converting coefficient </> <br />
        <> <strong>b</strong> - offset </> <br />
      </p>

      <Expander className='About-Examples' header={x => x ? 'Show Fahrenheit to Celsius example' : 'Hide Fahrenheit to Celsius example'}>
        <p>
          For example, here is how to convert <strong>Fahrenheit's</strong> to <strong>Celsius</strong>: 
          <BlockMath>{'y [\\degree C] = \\frac{5}{9}x [\\degree F] - \\frac{160}{9}'}</BlockMath>
          In that case: <InlineMath>{'k = \\frac{5}{9} [\\frac{\\degree C}{\\degree F}]'}</InlineMath>, and <InlineMath>{'b = \\frac{160}{9} [\\degree C]'}</InlineMath>
        </p>
      </Expander>

      <Expander className='About-Examples' header={x => x ? 'Show pounds to grams example' : 'Hide pounds to grams example'} >
        <p>
          Or, here is how to convert <strong>pounds</strong> to <strong>grams</strong>:
          <BlockMath>{'y [g] = 453.5924x [lb]'}</BlockMath>
          In that case: <InlineMath>{'k = 453.5924 [\\frac{g}{lb}]'}</InlineMath>, and <InlineMath>{'b = 0 [g]'}</InlineMath>
        </p>
      </Expander>

      <br />
      <br />

      <BuyCoffeeLinkButton />

      <br />
      <br />

      <CopyrightInfo />
    </div>
  );
}
