import packageJson from '../../package.json';

export default function CopyrightInfo() {
  return (
    <div className='Copyright-info'>
      <div>Version</div>
      <span>{packageJson.version}</span>
    </div>
  );
}
