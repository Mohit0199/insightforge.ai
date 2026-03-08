import React from 'react';

function About() {
    return (
        <div className="page-container animate-fade-in">
            <h1 className="page-title heading-gradient">About Insightforge</h1>

            <div className="page-content">
                <p>
                    Insightforge is built to simplify the world of AI, automation, machine learning, and data.
                </p>
                <p>
                    My goal is to make complex technology easy to understand through short guides, quick insights, and practical tutorials that anyone can learn from.
                </p>

                <h3 className="section-subtitle">The content on this site is focused on:</h3>
                <ul className="content-list">
                    <li>AI tools and automation workflows</li>
                    <li>Explaining Machine Learning, Deep Learning, NLP, Generative AI, and Agentic AI in simple, practical terms.</li>
                    <li>Tech facts and fast learning posts</li>
                    <li>Productivity ideas powered by AI</li>
                </ul>

                <div className="founder-section">
                    <p>
                        Insightforge is run by <strong>Mohit Rathod</strong>, a data scientist and AI enthusiast who is exploring, building, and sharing knowledge while growing his AI automation brand <strong>Insightforge.ai</strong>.
                    </p>
                    <p>
                        This is created for learners, developers, creators, and anyone who wants to stay updated with modern technology.
                    </p>
                    <p className="highlight-text">
                        If you love AI and tech, you're in the right place.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default About;
