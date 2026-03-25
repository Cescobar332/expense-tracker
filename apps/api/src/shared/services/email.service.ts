import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dns from 'dns';
import * as tls from 'tls';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private smtpConfig: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
  };

  constructor() {
    const port = Number(process.env.SMTP_PORT) || 465;
    this.smtpConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    };
  }

  async onModuleInit() {
    // Test SMTP connection on startup
    try {
      const transporter = await this.createTransporter();
      await transporter.verify();
      this.logger.log(
        `SMTP connection verified (port ${this.smtpConfig.port}, secure: ${this.smtpConfig.secure})`,
      );
      transporter.close();
    } catch (err) {
      this.logger.error('SMTP connection failed', (err as Error).message);
    }
  }

  private resolveIPv4(hostname: string): Promise<string> {
    return new Promise((resolve, reject) => {
      dns.resolve4(hostname, (err, addresses) => {
        if (err) {
          reject(err);
          return;
        }
        if (addresses.length === 0) {
          reject(new Error(`No IPv4 address found for ${hostname}`));
          return;
        }
        const address = addresses[0];
        this.logger.debug(`Resolved ${hostname} to ${address} (IPv4)`);
        resolve(address);
      });
    });
  }

  private async createTransporter(): Promise<nodemailer.Transporter> {
    const { host, port, secure, user, pass } = this.smtpConfig;

    // Resolve hostname to IPv4 address to bypass IPv6 issues on Railway
    let ipAddress: string;
    try {
      ipAddress = await this.resolveIPv4(host);
    } catch {
      this.logger.warn(`IPv4 resolution failed for ${host}, using hostname directly`);
      ipAddress = host;
    }

    // Create custom TLS socket for secure connection
    if (secure) {
      return new Promise((resolve, reject) => {
        const socket = tls.connect(
          {
            host: ipAddress,
            port,
            servername: host, // For TLS certificate validation
          },
          () => {
            const transporter = nodemailer.createTransport({
              host,
              port,
              secure: true,
              auth: { user, pass },
              socket, // Use our pre-connected IPv4 socket
            } as nodemailer.TransportOptions);
            resolve(transporter);
          },
        );

        socket.on('error', reject);
        socket.setTimeout(10000, () => {
          socket.destroy();
          reject(new Error('Socket connection timeout'));
        });
      });
    }

    // For non-secure connections, use standard transporter with resolved IP
    return nodemailer.createTransport({
      host: ipAddress,
      port,
      secure: false,
      auth: { user, pass },
      tls: {
        servername: host,
      },
    });
  }

  private getFromAddress(): string {
    // Gmail requires the from address to match the authenticated user
    return `"FinanceApp" <${this.smtpConfig.user}>`;
  }

  async sendPasswordResetEmail(
    to: string,
    token: string,
    lang = 'es',
  ): Promise<void> {
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

    const transporter = await this.createTransporter();
    try {
      await transporter.sendMail({
        from: this.getFromAddress(),
        to,
        subject: subjects[lang] || subjects.es,
        html: bodies[lang] || bodies.es,
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } finally {
      transporter.close();
    }
  }

  async sendVerificationEmail(
    to: string,
    token: string,
    lang = 'es',
  ): Promise<void> {
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

    const transporter = await this.createTransporter();
    try {
      await transporter.sendMail({
        from: this.getFromAddress(),
        to,
        subject: subjects[lang] || subjects.es,
        html: bodies[lang] || bodies.es,
      });
      this.logger.log(`Verification email sent to ${to}`);
    } finally {
      transporter.close();
    }
  }
}
