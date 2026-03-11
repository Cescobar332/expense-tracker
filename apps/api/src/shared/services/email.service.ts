import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string, lang = 'es'): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const subjects: Record<string, string> = {
      es: 'Recuperar contrasena - FinanceApp',
      en: 'Password Recovery - FinanceApp',
      pt: 'Recuperar senha - FinanceApp',
      fr: 'Recuperation de mot de passe - FinanceApp',
    };

    const bodies: Record<string, string> = {
      es: `<h2>Recuperar contrasena</h2><p>Haz clic en el siguiente enlace para restablecer tu contrasena:</p><a href="${resetUrl}">${resetUrl}</a><p>Este enlace expira en 1 hora.</p>`,
      en: `<h2>Password Recovery</h2><p>Click the following link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a><p>This link expires in 1 hour.</p>`,
      pt: `<h2>Recuperar senha</h2><p>Clique no link a seguir para redefinir sua senha:</p><a href="${resetUrl}">${resetUrl}</a><p>Este link expira em 1 hora.</p>`,
      fr: `<h2>Recuperation de mot de passe</h2><p>Cliquez sur le lien suivant pour reinitialiser votre mot de passe :</p><a href="${resetUrl}">${resetUrl}</a><p>Ce lien expire dans 1 heure.</p>`,
    };

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || '"FinanceApp" <noreply@financeapp.com>',
      to,
      subject: subjects[lang] || subjects.es,
      html: bodies[lang] || bodies.es,
    });
  }

  async sendVerificationEmail(to: string, token: string, lang = 'es'): Promise<void> {
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    const subjects: Record<string, string> = {
      es: 'Verifica tu correo - FinanceApp',
      en: 'Verify your email - FinanceApp',
      pt: 'Verifique seu e-mail - FinanceApp',
      fr: 'Vérifiez votre e-mail - FinanceApp',
    };

    const bodies: Record<string, string> = {
      es: `<h2>Verificación de correo</h2><p>Haz clic en el siguiente enlace para verificar tu correo electrónico:</p><a href="${verifyUrl}">${verifyUrl}</a><p>Este enlace expira en 24 horas.</p>`,
      en: `<h2>Email Verification</h2><p>Click the following link to verify your email address:</p><a href="${verifyUrl}">${verifyUrl}</a><p>This link expires in 24 hours.</p>`,
      pt: `<h2>Verificação de e-mail</h2><p>Clique no link a seguir para verificar seu endereço de e-mail:</p><a href="${verifyUrl}">${verifyUrl}</a><p>Este link expira em 24 horas.</p>`,
      fr: `<h2>Vérification d'e-mail</h2><p>Cliquez sur le lien suivant pour vérifier votre adresse e-mail :</p><a href="${verifyUrl}">${verifyUrl}</a><p>Ce lien expire dans 24 heures.</p>`,
    };

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || '"FinanceApp" <noreply@financeapp.com>',
      to,
      subject: subjects[lang] || subjects.es,
      html: bodies[lang] || bodies.es,
    });
  }
}
