/*global chrome*/
import { InlineMath, BlockMath } from "react-katex";
import Expander from './../components/Expander';
import packageJson from './../../package.json';

import './About.css';
import "katex/dist/katex.min.css";

function CopyrightInfo({ author, email, license, version }) {
  return (
    <div className='Copyright-info'>
      <div>Author</div>
      <span>
        <a title='Send email to author' href={`mailto:${email}`}>{author}</a>
      </span>
      <div>License</div>
      <span>{license}</span>
      <div>Version</div>
      <span>v{version}</span>
    </div>
  );
}

function About() {
  return (
    <div className='About'>
      <h2>About</h2>
      <p>This extension helps you seamlessly convert measurements from one unit to another but only those which relation are in a linear fashion.</p>
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
          In that case: <InlineMath>{'k = \\frac{5}{9} [\\frac{\\degree C}{\\degree F}]'}</InlineMath>, and <InlineMath>{'b = -\\frac{160}{9} [\\degree C]'}</InlineMath>
        </p>
      </Expander>

      <Expander className='About-Examples' header={x => x ? 'Show pounds to grams example' : 'Hide pounds to grams example'} >
        <p>
          Or, here is how to convert <strong>pounds</strong> to <strong>grams</strong>:
          <BlockMath>{'y [g] = 453.5924x [lb]'}</BlockMath>
          In that case: <InlineMath>{'k = 453.5924 [\\frac{g}{lb}]'}</InlineMath>, and <InlineMath>{'b = 0 [g]'}</InlineMath>
        </p>
      </Expander>

      <CopyrightInfo
        author={packageJson.author.name}
        email={packageJson.author.email}
        license={packageJson.license}
        version={packageJson.version}
      />
    </div>
  );
}

export default About;
