import React from 'react';
import classnames from 'classnames';
import styles from './styles.module.css';

const Welcome: React.FC = () => (
  <div>
    <h1 className="text-3xl lg:text-4xl font-light">
      Reach your supply
      chain sustainability
      targets
    </h1>
    <p className="mt-4">
      <a
        className={classnames('text-3xl lg:text-4xl font-bold', styles.linkAnimation)}
        href="https://medium.com/@Vizzuality/sustainable-supply-chain-ec-funding-announcement-78819a53ff3d"
      >
        Learn more
      </a>
    </p>
  </div>
);

export default Welcome;
