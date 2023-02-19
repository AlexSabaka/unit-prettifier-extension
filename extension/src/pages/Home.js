/*global chrome*/
import { processCurrentTab } from '../utils/processCurrentTab';
import Button from './../components/Button';
import BuyCoffeeLinkButton from './../components/BuyCoffeeLinkButton';
import './Home.css';

function Home() {
  return (
    <div className='Home'>
      <Button onClick={processCurrentTab} content="Convert" />
    </div>
  );
}

export default Home;
