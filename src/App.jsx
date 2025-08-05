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
    
    const cursorSpeed = 0.3;
    const followerSpeed = 0.1;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animateCursor = () => {
      if (cursorRef.current && cursorFollowerRef.current) {
        cursorX += (mouseX - cursorX) * cursorSpeed;
        cursorY += (mouseY - cursorY) * cursorSpeed;
        cursorRef.current.style.left = `${cursorX}px`;
        cursorRef.current.style.top = `${cursorY}px`;
        followerX += (mouseX - followerX) * followerSpeed;
        followerY += (mouseY - followerY) * followerSpeed;
        cursorFollowerRef.current.style.left = `${followerX}px`;
        cursorFollowerRef.current.style.top = `${followerY}px`;
      }
      requestAnimationFrame(animateCursor);
    };

    document.body.style.cursor = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    animateCursor();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed w-3 h-3 rounded-full bg-indigo-500 z-[9999] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
        style={{
          transition: 'none',
          willChange: 'transform'
        }}
      />
      <div
        ref={cursorFollowerRef}
        className="fixed w-8 h-8 rounded-full border-2 border-indigo-400 z-[9998] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 opacity-50"
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
  // TEMPORARY DEBUGGING FUNCTION
const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    const apiUrl = import.meta.env.VITE_API_URL;
    
    alert("The API URL my code sees is: " + apiUrl); 
};

    return (
      <div className="min-h-screen bg-gray-950 text-gray-200 font-poppins relative overflow-hidden">
        <CustomCursor />
        <nav className="fixed w-full bg-gray-900 bg-opacity-90 backdrop-blur-sm z-40 shadow-lg py-4">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <a href="#home" className="text-white text-3xl font-extrabold font-montserrat">
                    Om<span className="text-indigo-500">.</span>
                </a>
                <div className={`md:flex nav-links ${isNavActive ? 'flex flex-col absolute top-full left-0 w-full bg-gray-900 md:relative md:flex-row md:space-x-8 md:bg-transparent md:top-0 md:w-auto p-4 md:p-0 items-center justify-center shadow-lg md:shadow-none' : 'hidden'}`}>
                    <a href="#home" onClick={(e) => handleNavLinkClick(e, '#home')} className="nav-link text-gray-300 hover:text-indigo-500 transition-colors duration-300 px-3 py-2 text-lg font-medium">Home</a>
                    <a href="#skills" onClick={(e) => handleNavLinkClick(e, '#skills')} className="nav-link text-gray-300 hover:text-indigo-500 transition-colors duration-300 px-3 py-2 text-lg font-medium">Skills</a>
                    <a href="#projects" onClick={(e) => handleNavLinkClick(e, '#projects')} className="nav-link text-gray-300 hover:text-indigo-500 transition-colors duration-300 px-3 py-2 text-lg font-medium">Projects</a>
                    <a href="#contact" onClick={(e) => handleNavLinkClick(e, '#contact')} className="nav-link text-gray-300 hover:text-indigo-500 transition-colors duration-300 px-3 py-2 text-lg font-medium">Contact</a>
                </div>
                <button
                    className="hamburger block md:hidden text-gray-200 focus:outline-none z-50 relative"
                    onClick={() => setIsNavActive(!isNavActive)}
                >
                    <div className={`bar h-0.5 w-6 bg-gray-200 my-1 transition-all duration-300 ${isNavActive ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                    <div className={`bar h-0.5 w-6 bg-gray-200 my-1 transition-all duration-300 ${isNavActive ? 'opacity-0' : ''}`}></div>
                    <div className={`bar h-0.5 w-6 bg-gray-200 my-1 transition-all duration-300 ${isNavActive ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
                </button>
            </div>
        </nav>
        <section id="home" className="hero relative flex items-center justify-center min-h-screen pt-20 px-4">
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
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-12 py-16 text-center md:text-left z-10">
                <div className="hero-content max-w-2xl">
                    <h1 className="animated-text text-5xl md:text-6xl lg:text-7xl font-montserrat font-extrabold leading-tight text-white mb-6">
                        <span>Hi, I'm</span> <br />
                        <span className="name text-indigo-400 block min-h-[1.5em] whitespace-nowrap">{nameText}</span>
                        <span className="title text-gray-300 block text-4xl md:text-5xl lg:text-6xl">MERN Stack Developer</span>
                    </h1>
                    <p className="hero-description text-lg md:text-xl text-gray-400 mb-8 max-w-xl mx-auto md:mx-0">
                        I build modern, responsive web applications with cutting-edge technologies.
                        Passionately about creating seamless user experiences and solving complex problems with elegant
                        solutions.
                    </p>
                    <div className="hero-btns flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                        <a href="#projects" className="btn btn-primary relative overflow-hidden rounded-full px-8 py-3 bg-indigo-600 text-white font-semibold text-lg shadow-lg hover:bg-indigo-700 hover:scale-105 hover:shadow-2xl transition-all duration-300 group">
                            <span>View Projects</span>
                            <div className="absolute inset-0 bg-white opacity-20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </a>
                        <a href="#contact" className="btn btn-secondary relative overflow-hidden rounded-full px-8 py-3 bg-transparent border-2 border-indigo-600 text-indigo-400 font-semibold text-lg shadow-lg hover:bg-indigo-600 hover:text-white hover:scale-105 hover:shadow-2xl transition-all duration-300 group">
                            <span>Contact Me</span>
                            <div className="absolute inset-0 bg-white opacity-20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </a>
                    </div>
                </div>
                {/* ... other sections ... */}
            </div>
        </section>
        
        {/* All other sections like Skills, Projects, Contact, Footer go here, I've removed them for brevity but they should be in your actual file. */}
        {/* Make sure the <section id="contact"> containing your <form> is here. */}
        <section id="contact" className="contact py-20 px-4 bg-gray-900">
            <div className="container mx-auto">
                <h2 className="section-title text-4xl md:text-5xl font-montserrat font-bold text-white text-center mb-12">Get In Touch</h2>
                <div className="contact-container flex flex-col lg:flex-row gap-12 items-center lg:items-start">
                    <div className="contact-info bg-gray-800 p-8 rounded-lg shadow-xl lg:w-1/2 text-center lg:text-left">
                        {/* ... your contact info ... */}
                    </div>
                    <div className="contact-form bg-gray-800 p-8 rounded-lg shadow-xl lg:w-1/2">
                        <form onSubmit={handleFormSubmit}>
                            {/* ... your form inputs and button ... */}
                                <div className="form-group mb-6">
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        placeholder="Your Name"
                                        className="w-full p-4 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 outline-none transition-all duration-300 focus:shadow-md focus:shadow-indigo-500/30"
                                        required
                                    />
                                </div>
                                <div className="form-group mb-6">
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="Your Email"
                                        className="w-full p-4 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 outline-none transition-all duration-300 focus:shadow-md focus:shadow-indigo-500/30"
                                        required
                                    />
                                </div>
                                <div className="form-group mb-6">
                                    <textarea
                                        id="message"
                                        name="message"
                                        placeholder="Your Message"
                                        rows="6"
                                        className="w-full p-4 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 outline-none transition-all duration-300 resize-y focus:shadow-md focus:shadow-indigo-500/30"
                                        required
                                    ></textarea>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="submit-btn relative overflow-hidden w-full rounded-md px-6 py-3 bg-indigo-600 text-white font-semibold text-lg shadow-lg hover:bg-indigo-700 hover:scale-105 hover:shadow-2xl transition-all duration-300 group flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                </button>
                                
                                {formMessage.text && (
                                    <div className={`mt-4 p-4 rounded-md text-center text-lg ${
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
        <footer className="footer bg-gray-950 py-8 px-4 text-center border-t border-gray-800">
          <div className="container mx-auto">
            <p className="text-gray-500 text-md">&copy; {new Date().getFullYear()} Om Prakash. All rights reserved.</p>
          </div>
        </footer>
      </div>
    );
};

export default App;
