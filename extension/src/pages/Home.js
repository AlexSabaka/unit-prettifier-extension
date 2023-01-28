/*global chrome*/
import { processCurrentTab } from '../utils/pageProcessor';
import Button from './../components/Button';
import './Home.css';

function Home() {
  return (
    <div className='Home'>
      <Button onClick={processCurrentTab} content="Convert" />
    </div>
  );
}

export default Home;
