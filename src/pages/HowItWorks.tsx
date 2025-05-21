import React from 'react';
import Layout from '../components/Layout';

function HowItWorks() {
  return (
    <Layout>
      <div className="section">
        <div className="container-custom">
          <h1 className="mb-8 text-center">How It Works</h1>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            <div className="fade-in">
              <h3 className="mb-4">Step 1</h3>
              <p>Content for step 1 goes here.</p>
            </div>
            <div className="fade-in">
              <h3 className="mb-4">Step 2</h3>
              <p>Content for step 2 goes here.</p>
            </div>
            <div className="fade-in">
              <h3 className="mb-4">Step 3</h3>
              <p>Content for step 3 goes here.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default HowItWorks;