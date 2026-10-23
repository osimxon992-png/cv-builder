// Demo content for template previews only. Real CVs always start empty.
import { createCv, newEntry } from '../lib/cvModel.js';

export function sampleCv(templateId, cvLanguage = 'en') {
  const cv = createCv({ templateId, cvLanguage, title: 'Sample' });
  cv.personal = {
    ...cv.personal,
    fullName: 'Aziza Karimova',
    title: 'Frontend Developer',
    email: 'aziza.karimova@example.com',
    phone: '+998 90 123 45 67',
    city: 'Tashkent',
    country: 'Uzbekistan',
    linkedin: 'linkedin.com/in/aziza-example',
    website: 'github.com/aziza-example',
  };
  cv.summary = 'Frontend developer with 4 years of experience building fast, accessible web applications with React. Enjoys turning complex requirements into simple interfaces and mentoring junior developers.';
  cv.experience = [
    newEntry('experience', {
      company: 'Silk Road Digital', position: 'Frontend Developer', location: 'Tashkent', startDate: '2022-03', current: true,
      description: '- Rebuilt the customer dashboard in React, cutting load time by 40%\n- Introduced component library used by 4 product teams\n- Mentored 3 junior developers',
    }),
    newEntry('experience', {
      company: 'Samarkand Soft', position: 'Junior Web Developer', location: 'Samarkand', startDate: '2020-07', endDate: '2022-02',
      description: '- Developed landing pages and admin panels\n- Wrote unit tests that raised coverage from 20% to 65%',
    }),
  ];
  cv.education = [
    newEntry('education', { institution: 'Tashkent University of Information Technologies', degree: 'Bachelor', field: 'Software Engineering', startDate: '2016-09', endDate: '2020-06' }),
  ];
  cv.skills = ['React', 'JavaScript', 'TypeScript', 'HTML & CSS', 'Git', 'REST APIs'].map((name) => newEntry('skills', { name }))
    .concat(['Teamwork', 'Mentoring', 'Communication'].map((name) => newEntry('skills', { name, category: 'professional' })));
  cv.projects = [
    newEntry('projects', { name: 'Bozor — marketplace app', description: 'Open-source marketplace for local farmers with search and online orders.', technologies: 'React, Node.js, PostgreSQL', repo: 'github.com/aziza-example/bozor' }),
  ];
  cv.languages = [
    newEntry('languages', { name: 'Uzbek', level: 'native' }),
    newEntry('languages', { name: 'Russian', level: 'fluent' }),
    newEntry('languages', { name: 'English', level: 'advanced' }),
  ];
  cv.certifications = [newEntry('certifications', { title: 'Meta Front-End Developer', issuer: 'Coursera', date: '2021-11' })];
  cv.interests = ['Chess', 'Hiking', 'Open source'].map((name) => newEntry('interests', { name }));
  return cv;
}
