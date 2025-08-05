import React, { useState, useEffect, useRef, useCallback } from 'react';

// ParticleBackground Component
const ParticleBackground = ({
  particleColor = '#8d5fff',
  lineColor = '#4a00e0',
  particleCount = 100,
  maxDistance = 100,
  speedFactor = 0.5,
  className = '',
}) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const animationFrameId = useRef(null);
  const particles = useRef([]);

  const generateParticles = useCallback((canvasWidth, canvasHeight) => {
    particles.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      radius: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * speedFactor,
      dy: (Math.random() - 0.5) * speedFactor,
    }));
  }, [particleCount, speedFactor]);

  const drawParticles = useCallback((ctx, canvasWidth, canvasHeight) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = particleColor;
    ctx.strokeStyle = lineColor;

    particles.current.forEach((p, i) => {
      p.x += p.dx;
      p.y += p.dy;

      if (p.x + p.radius > canvasWidth || p.x - p.radius < 0) p.dx *= -1;
      if (p.y + p.radius > canvasHeight || p.y - p.radius < 0) p.dy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < particles.current.length; j++) {
        const p2 = particles.current[j];
        const distance = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));

        if (distance < maxDistance) {
          ctx.lineWidth = 1;
          ctx.globalAlpha = 1 - (distance / maxDistance);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    });
    ctx.globalAlpha = 1;
  }, [particleColor, lineColor, maxDistance]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    drawParticles(ctx, canvas.width, canvas.height);
    animationFrameId.current = requestAnimationFrame(animate);
  }, [drawParticles]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    if (contextRef.current) {
      contextRef.current.scale(dpr, dpr);
    }

    generateParticles(rect.width, rect.height);
  }, [generateParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    contextRef.current = canvas.getContext('2d');
    resizeCanvas();
    animate();

    const handleResize = () => {
      cancelAnimationFrame(animationFrameId.current);
      resizeCanvas();
      animate();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [animate, resizeCanvas]);

  const containerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: -1,
  };

  const canvasStyle = {
    display: 'block',
    width: '100%',
    height: '100%',
  };

  return (
    <div style={containerStyle} className={className}>
      <canvas ref={canvasRef} style={canvasStyle} />
    </div>
  );
};

// Custom Cursor Component
const CustomCursor = () => {
  const cursorRef = useRef(null);
  const cursorFollowerRef = useRef(null);

  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let followerX = 0;
    let followerY = 0;
    
    // Fast cursor dot
    const cursorSpeed = 0.3;
    // Slower follower for trailing effect
    const followerSpeed = 0.1;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animateCursor = () => {
      if (cursorRef.current && cursorFollowerRef.current) {
        // Main cursor dot - fast and responsive
        cursorX += (mouseX - cursorX) * cursorSpeed;
        cursorY += (mouseY - cursorY) * cursorSpeed;
        cursorRef.current.style.left = `${cursorX}px`;
        cursorRef.current.style.top = `${cursorY}px`;

        // Cursor follower - slower for trailing effect
        followerX += (mouseX - followerX) * followerSpeed;
        followerY += (mouseY - followerY) * followerSpeed;
        cursorFollowerRef.current.style.left = `${followerX}px`;
        cursorFollowerRef.current.style.top = `${followerY}px`;
      }
      requestAnimationFrame(animateCursor);
    };

    // Only show custom cursor on desktop devices
    if (window.innerWidth > 768) {
      // Hide default cursor
      document.body.style.cursor = 'none';

      document.addEventListener('mousemove', handleMouseMove);
      animateCursor();

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.body.style.cursor = 'auto';
      };
    }
  }, []);

  // Hide cursor on mobile devices
  if (typeof window !== 'undefined' && window.innerWidth <= 768) {
    return null;
  }

  return (
    <>
      {/* Main cursor dot */}
      <div
        ref={cursorRef}
        className="fixed w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-indigo-500 z-[9999] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
        style={{
          transition: 'none',
          willChange: 'transform'
        }}
      />
      {/* Cursor follower */}
      <div
        ref={cursorFollowerRef}
        className="fixed w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-indigo-400 z-[9998] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 opacity-50"
        style={{
          transition: 'none',
          willChange: 'transform'
        }}
      />
    </>
  );
};

// Main App Component
const App = () => {
    const [isNavActive, setIsNavActive] = useState(false);
    const [nameText, setNameText] = useState('');
    const [formMessage, setFormMessage] = useState({ text: '', type: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Typing effect for the name
    useEffect(() => {
        const fullText = "Om Prakash Parida";
        let currentIndex = fullText.length;
        let deleting = true;
        let typingSpeed = 150;

        const typeLoop = () => {
            if (deleting && currentIndex > 0) {
                currentIndex--;
                setNameText(fullText.substring(0, currentIndex));
            } else if (!deleting && currentIndex < fullText.length) {
                setNameText(fullText.substring(0, currentIndex + 1));
                currentIndex++;
            }

            if (currentIndex === 0) {
                deleting = false;
                typingSpeed = 500;
            } else if (currentIndex === fullText.length) {
                deleting = true;
                typingSpeed = 1500;
            } else {
                typingSpeed = deleting ? 100 : 150;
            }
            setTimeout(typeLoop, typingSpeed);
        };
        typeLoop();
    }, []);

    const handleNavLinkClick = (e, targetId) => {
        e.preventDefault();
        setIsNavActive(false);
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    };

    // Backend API form submission handler
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormMessage({ text: '', type: '' });

        const formData = new FormData(e.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');

        if (!name || !email || !message) {
            setFormMessage({ text: 'Please fill in all fields.', type: 'error' });
            setIsSubmitting(false);
            return;
        }

        try {
            // Use environment variable for API URL, fallback to localhost for development
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/contact/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    message: message.trim()
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setFormMessage({ 
                    text: data.message, 
                    type: 'success' 
                });
                e.target.reset(); // Clear the form
            } else {
                // Handle validation errors specifically
                if (data.errors && data.errors.length > 0) {
                    const errorMessages = data.errors.map(error => error.msg).join(', ');
                    setFormMessage({ 
                        text: `Validation error: ${errorMessages}`, 
                        type: 'error' 
                    });
                } else {
                    setFormMessage({ 
                        text: data.message || 'Something went wrong. Please try again later.', 
                        type: 'error' 
                    });
                }
            }
        } catch (error) {
            console.error('Form submission error:', error);
            setFormMessage({ 
                text: 'Failed to send message. Please try again later.', 
                type: 'error' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-200 font-poppins relative overflow-hidden">
            {/* Custom Cursor */}
            <CustomCursor />

            {/* Navigation */}
            <nav className="fixed w-full bg-gray-900 bg-opacity-90 backdrop-blur-sm z-40 shadow-lg py-2 sm:py-4">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <a href="#home" className="text-white text-2xl sm:text-3xl font-extrabold font-montserrat">
                        Om<span className="text-indigo-500">.</span>
                    </a>
                    <div className={`nav-links ${isNavActive ? 'flex flex-col absolute top-full left-0 w-full bg-gray-900 md:relative md:flex-row md:space-x-6 lg:space-x-8 md:bg-transparent md:top-0 md:w-auto p-4 md:p-0 items-center justify-center shadow-lg md:shadow-none border-t border-gray-700 md:border-none' : 'hidden'} md:flex`}>
                        <a href="#home" onClick={(e) => handleNavLinkClick(e, '#home')} className="nav-link text-gray-300 hover:text-indigo-500 transition-colors duration-300 px-3 py-3 sm:py-2 text-base sm:text-lg font-medium w-full md:w-auto text-center md:text-left">Home</a>
                        <a href="#skills" onClick={(e) => handleNavLinkClick(e, '#skills')} className="nav-link text-gray-300 hover:text-indigo-500 transition-colors duration-300 px-3 py-3 sm:py-2 text-base sm:text-lg font-medium w-full md:w-auto text-center md:text-left">Skills</a>
                        <a href="#projects" onClick={(e) => handleNavLinkClick(e, '#projects')} className="nav-link text-gray-300 hover:text-indigo-500 transition-colors duration-300 px-3 py-3 sm:py-2 text-base sm:text-lg font-medium w-full md:w-auto text-center md:text-left">Projects</a>
                        <a href="#contact" onClick={(e) => handleNavLinkClick(e, '#contact')} className="nav-link text-gray-300 hover:text-indigo-500 transition-colors duration-300 px-3 py-3 sm:py-2 text-base sm:text-lg font-medium w-full md:w-auto text-center md:text-left">Contact</a>
                    </div>
                    <button
                        className="hamburger block md:hidden text-gray-200 focus:outline-none z-50 relative p-2"
                        onClick={() => setIsNavActive(!isNavActive)}
                        aria-label="Toggle navigation menu"
                    >
                        <div className={`bar h-0.5 w-6 bg-gray-200 my-1 transition-all duration-300 ${isNavActive ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                        <div className={`bar h-0.5 w-6 bg-gray-200 my-1 transition-all duration-300 ${isNavActive ? 'opacity-0' : ''}`}></div>
                        <div className={`bar h-0.5 w-6 bg-gray-200 my-1 transition-all duration-300 ${isNavActive ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="hero relative flex items-center justify-center min-h-screen pt-16 sm:pt-20 px-4 sm:px-6 lg:px-8">
                {/* Particle Background Effect */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <ParticleBackground
                        particleColor="#8d5fff"
                        lineColor="#4a00e0"
                        particleCount={100}
                        maxDistance={100}
                        speedFactor={0.5}
                        className="w-full h-full"
                    />
                </div>

                <div className="container mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 py-8 sm:py-12 lg:py-16 text-center lg:text-left z-10">
                    <div className="hero-content max-w-2xl order-2 lg:order-1">
                        <h1 className="animated-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-montserrat font-extrabold leading-tight text-white mb-4 sm:mb-6">
                            <span className="block">Hi, I'm</span>
                            <span className="name text-indigo-400 block min-h-[1.2em] sm:min-h-[1.5em] whitespace-nowrap">{nameText}</span>
                            <span className="title text-gray-300 block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">MERN Stack Developer</span>
                        </h1>
                        <p className="hero-description text-base sm:text-lg md:text-xl text-gray-400 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            I build modern, responsive web applications with cutting-edge technologies.
                            Passionately about creating seamless user experiences and solving complex problems with elegant
                            solutions.
                        </p>
                        <div className="hero-btns flex flex-col sm:flex-row justify-center lg:justify-start gap-3 sm:gap-4">
                            <a href="#projects" className="btn btn-primary relative overflow-hidden rounded-full px-6 sm:px-8 py-3 bg-indigo-600 text-white font-semibold text-base sm:text-lg shadow-lg hover:bg-indigo-700 hover:scale-105 hover:shadow-2xl transition-all duration-300 group">
                                <span>View Projects</span>
                                <div className="absolute inset-0 bg-white opacity-20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                            </a>
                            <a href="#contact" className="btn btn-secondary relative overflow-hidden rounded-full px-6 sm:px-8 py-3 bg-transparent border-2 border-indigo-600 text-indigo-400 font-semibold text-base sm:text-lg shadow-lg hover:bg-indigo-600 hover:text-white hover:scale-105 hover:shadow-2xl transition-all duration-300 group">
                                <span>Contact Me</span>
                                <div className="absolute inset-0 bg-white opacity-20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                            </a>
                        </div>
                    </div>
                    <div className="hero-graphic relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 flex items-center justify-center order-1 lg:order-2 mb-8 lg:mb-0">
                        <div className="absolute w-full h-full rounded-full bg-indigo-500 opacity-20 animate-pulse"></div>
                        <div className="floating-icons grid grid-cols-3 gap-x-8 sm:gap-x-12 gap-y-6 sm:gap-y-8 animate-fade-in-up">
                            <div className="floating-icon absolute -top-4 sm:-top-8 -left-4 sm:-left-8 text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-blue-400 animate-float-1"><i className="fab fa-react"></i></div>
                            <div className="floating-icon absolute -bottom-4 sm:-bottom-8 -right-4 sm:-right-8 text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-green-400 animate-float-2"><i className="fab fa-node-js"></i></div>
                            <div className="floating-icon absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-yellow-400 animate-float-3"><i className="fab fa-js"></i></div>
                            <div className="floating-icon absolute top-0 right-0 text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-orange-400 animate-float-4"><i className="fas fa-database"></i></div>
                            <div className="floating-icon absolute bottom-0 left-0 text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-red-400 animate-float-5"><i className="fab fa-html5"></i></div>
                            <div className="floating-icon absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-blue-600 animate-float-6"><i className="fab fa-css3-alt"></i></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Skills Section */}
            <section id="skills" className="skills py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
                <div className="container mx-auto">
                    <h2 className="section-title text-3xl sm:text-4xl md:text-5xl font-montserrat font-bold text-white text-center mb-8 sm:mb-12">My Skills</h2>
                    <div className="skills-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            { icon: 'fab fa-react', title: 'React.js', description: 'Building dynamic and responsive user interfaces with React and its ecosystem.' },
                            { icon: 'fab fa-node-js', title: 'Node.js', description: 'Developing scalable server-side applications and RESTful APIs with Express.' },
                            { icon: 'fas fa-database', title: 'MongoDB', description: 'Designing efficient database schemas and working with NoSQL databases.' },
                            { icon: 'fab fa-js', title: 'JavaScript', description: 'Expert in modern JavaScript (ES6+) for both frontend and backend development.' },
                            { icon: 'fab fa-html5', title: 'HTML5 & CSS3', description: 'Creating responsive layouts with semantic HTML and modern CSS techniques.' },
                            { icon: 'fas fa-server', title: 'API Integration', description: 'Integrating third-party APIs and services into web applications.' },
                        ].map((skill, index) => (
                            <div
                                key={index}
                                className="skill-card bg-gray-800 rounded-lg p-4 sm:p-6 shadow-xl text-center border-b-4 border-indigo-600 transform transition-all duration-700 ease-out opacity-100 translate-y-0 scale-100 hover:scale-105 hover:shadow-2xl hover:border-indigo-400 hover:-translate-y-2"
                            >
                                <div className="skill-icon text-indigo-400 text-4xl sm:text-5xl mb-3 sm:mb-4">
                                    <i className={skill.icon}></i>
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{skill.title}</h3>
                                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{skill.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Projects Section */}
            <section id="projects" className="projects py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gray-950">
                <div className="container mx-auto">
                    <h2 className="section-title text-3xl sm:text-4xl md:text-5xl font-montserrat font-bold text-white text-center mb-8 sm:mb-12">My Projects</h2>
                    <div className="projects-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            { icon: 'fas fa-shopping-cart', title: 'E-Commerce Platform', description: 'A full-featured online store with product catalog, shopping cart, and payment integration.', tags: ['React', 'Node.js', 'MongoDB', 'Stripe API'] },
                            { icon: 'fas fa-blog', title: 'Content Management System', description: 'A blogging platform with user authentication, rich text editor, and content management.', tags: ['MERN Stack', 'JWT', 'Redux'] },
                            { icon: 'fas fa-chart-line', title: 'Real-time Analytics Dashboard', description: 'A data visualization dashboard displaying real-time metrics with interactive charts.', tags: ['React', 'Socket.IO', 'Chart.js'] },
                        ].map((project, index) => (
                            <div
                                key={index}
                                className="project-card bg-gray-800 rounded-lg p-4 sm:p-6 shadow-xl border-l-4 border-indigo-600 transform transition-all duration-700 ease-out opacity-100 translate-y-0 scale-100 hover:scale-102 hover:shadow-2xl hover:border-indigo-400 hover:bg-gray-700"
                            >
                                <div className="project-header flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                                    <div className="text-indigo-400 text-2xl sm:text-3xl"><i className={project.icon}></i></div>
                                    <h3 className="text-lg sm:text-xl font-semibold text-white">{project.title}</h3>
                                </div>
                                <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">{project.description}</p>
                                <div className="tags flex flex-wrap gap-2 mb-3 sm:mb-4">
                                    {project.tags.map((tag, tagIndex) => (
                                        <span key={tagIndex} className="tag bg-gray-700 text-indigo-300 text-xs px-2 sm:px-3 py-1 rounded-full">{tag}</span>
                                    ))}
                                </div>
                                <a href="#" className="project-link text-indigo-400 hover:text-indigo-500 transition-colors duration-300 font-medium flex items-center gap-2 text-sm sm:text-base">
                                    View Project <i className="fas fa-arrow-right text-sm"></i>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="contact py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
                <div className="container mx-auto">
                    <h2 className="section-title text-3xl sm:text-4xl md:text-5xl font-montserrat font-bold text-white text-center mb-8 sm:mb-12">Get In Touch</h2>
                    <div className="contact-container flex flex-col lg:flex-row gap-8 sm:gap-12 items-center lg:items-start">
                        <div className="contact-info bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl lg:w-1/2 text-center lg:text-left">
                            <p className="text-gray-300 text-base sm:text-lg mb-4 sm:mb-6 leading-relaxed">
                                I'm currently available for freelance work and full-time positions. If you have a project that
                                you want to get started or think you need my help with something, then get in touch.
                            </p>
                            <div className="contact-details space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                                <p className="text-gray-300 flex items-center justify-center lg:justify-start gap-3 text-sm sm:text-lg"><i className="fas fa-envelope text-indigo-400"></i> omprakass747@gmail.com</p>
                                <p className="text-gray-300 flex items-center justify-center lg:justify-start gap-3 text-sm sm:text-lg"><i className="fas fa-map-marker-alt text-indigo-400"></i> Bhubaneswar,Odisha,India</p>
                                <p className="text-gray-300 flex items-center justify-center lg:justify-start gap-3 text-sm sm:text-lg"><i className="fas fa-phone text-indigo-400"></i> +91 9827995265</p>
                            </div>
                            <div className="social-links flex justify-center lg:justify-start gap-4 sm:gap-6 text-xl sm:text-2xl">
                                <a href="https://github.com/omprakashparida" className="text-gray-400 hover:text-indigo-500 hover:scale-110 transition-colors duration-300"><i className="fab fa-github"></i></a>
                                <a href="https://www.linkedin.com/in/om-prakash-parida-247982274" className="text-gray-400 hover:text-indigo-500 hover:scale-110 transition-colors duration-300"><i className="fab fa-linkedin-in"></i></a>
                                <a  className="text-gray-400 hover:text-indigo-500 hover:scale-110 transition-colors duration-300"><i className="fab fa-twitter"></i></a>
                                <a  className="text-gray-400 hover:text-indigo-500 hover:scale-110 transition-colors duration-300"><i className="fab fa-instagram"></i></a>
                            </div>
                        </div>
                        <div className="contact-form bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl lg:w-1/2 w-full">
                            <form onSubmit={handleFormSubmit}>
                                <div className="form-group mb-4 sm:mb-6">
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        placeholder="Your Name"
                                        className="w-full p-3 sm:p-4 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 outline-none transition-all duration-300 focus:shadow-md focus:shadow-indigo-500/30 text-sm sm:text-base"
                                        required
                                    />
                                </div>
                                <div className="form-group mb-4 sm:mb-6">
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="Your Email"
                                        className="w-full p-3 sm:p-4 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 outline-none transition-all duration-300 focus:shadow-md focus:shadow-indigo-500/30 text-sm sm:text-base"
                                        required
                                    />
                                </div>
                                <div className="form-group mb-4 sm:mb-6">
                                    <textarea
                                        id="message"
                                        name="message"
                                        placeholder="Your Message"
                                        rows="5"
                                        className="w-full p-3 sm:p-4 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 outline-none transition-all duration-300 resize-y focus:shadow-md focus:shadow-indigo-500/30 text-sm sm:text-base"
                                        required
                                    ></textarea>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="submit-btn relative overflow-hidden w-full rounded-md px-4 sm:px-6 py-3 bg-indigo-600 text-white font-semibold text-base sm:text-lg shadow-lg hover:bg-indigo-700 hover:scale-105 hover:shadow-2xl transition-all duration-300 group flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span>Sending...</span>
                                            <i className="fas fa-spinner fa-spin"></i>
                                        </>
                                    ) : (
                                        <>
                                            <span>Send Message</span>
                                            <i className="fas fa-paper-plane"></i>
                                        </>
                                    )}
                                    <div className="absolute inset-0 bg-white opacity-20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                                </button>
                                
                                {formMessage.text && (
                                    <div className={`mt-4 p-3 sm:p-4 rounded-md text-center text-sm sm:text-lg ${
                                        formMessage.type === 'success' 
                                            ? 'bg-green-500 text-white' 
                                            : 'bg-red-500 text-white'
                                    }`}>
                                        {formMessage.text}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer bg-gray-950 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 text-center border-t border-gray-800">
                <div className="container mx-auto">
                    <p className="text-gray-500 text-sm sm:text-md">&copy; {new Date().getFullYear()} Om Prakash. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default App; 
