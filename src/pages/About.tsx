import React from 'react';
import Layout from '../components/Layout';

function About() {
  return (
    <Layout>
      <div className="section">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="mb-6">About Us</h1>
            <p className="text-lg text-text-secondary mb-8">
              Welcome to our platform. We're dedicated to providing an exceptional experience for our users.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default About;