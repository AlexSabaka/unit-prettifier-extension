/*global chrome*/
import { useState } from 'react';
import { ApplyProcessorOnCurrentTab } from '../utils/pageProcessor';
import Button from './../components/Button';
import './Home.css';

function Home() {
  const [error, setError] = useState(undefined);

  return (
    <div className='Home'>
      <Button onClick={() => ApplyProcessorOnCurrentTab().catch(err => setError(err))} content="Convert" />
    </div>
  );
}

export default Home;
