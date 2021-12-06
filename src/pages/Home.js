/*global chrome*/
import { ApplyProcessorOnCurrentTab } from '../utils/pageProcessor';
import './Home.css';

function Home() {
  return (
    <div className='Home'>
      <h1>Hello!</h1>
      <button onClick={() => ApplyProcessorOnCurrentTab()}>Convert</button>
    </div>
  );
}

export default Home;
