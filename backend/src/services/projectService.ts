import { db } from '../db';
import { projects, projectParticipations, wallets, pointBalances } from '../db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { mintService } from './mintService';
import { createToken } from './tokenService';

interface CreateProjectData {
  creatorWalletAddress: string;
  tokenName: string;
  tokenSymbol: string;
  totalSupply: number;
  decimals: number;
  description: string;
  logoUrl?: string;
  airdropPercent: number;
  liquidityPercent: number;
  initialLiquidityXLM: number;
  eventDurationDays: number;
  vestingEnabled: boolean;
  vestingMonths?: number;
}

interface ParticipateData {
  projectId: string;
  participantWalletAddress: string;
  xlmAmount: number;
  transactionHash: string;
}

export class ProjectService {
  async createProject(data: CreateProjectData) {
    const creatorWallet = await mintService.getOrCreateWallet(data.creatorWalletAddress);

    const creatorPercent = 100 - data.airdropPercent - data.liquidityPercent;
    const eventStartDate = new Date();
    const eventEndDate = new Date(Date.now() + data.eventDurationDays * 24 * 60 * 60 * 1000);

    const [project] = await db.insert(projects).values({
      creatorWalletId: creatorWallet.id,
      creatorWalletAddress: data.creatorWalletAddress,
      tokenName: data.tokenName,
      tokenSymbol: data.tokenSymbol,
      totalSupply: data.totalSupply.toString(),
      decimals: data.decimals,
      description: data.description,
      logoUrl: data.logoUrl,
      airdropPercent: data.airdropPercent.toString(),
      liquidityPercent: data.liquidityPercent.toString(),
      creatorPercent: creatorPercent.toString(),
      initialLiquidityXLM: data.initialLiquidityXLM.toString(),
      eventDurationDays: data.eventDurationDays,
      eventStartDate,
      eventEndDate,
      status: 'active',
      vestingEnabled: data.vestingEnabled,
      vestingMonths: data.vestingMonths,
    }).returning();

    return project;
  }

  async getActiveProjects() {
    const activeProjects = await db.select()
      .from(projects)
      .where(
        and(
          eq(projects.status, 'active'),
          sql`${projects.eventEndDate} > NOW()`
        )
      )
      .orderBy(desc(projects.createdAt));

    return activeProjects;
  }

  async getProject(projectId: string) {
    const [project] = await db.select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  }

  async participate(data: ParticipateData) {
    const project = await this.getProject(data.projectId);

    if (project.status !== 'active') {
      throw new Error('Project is not active');
    }

    if (new Date() > new Date(project.eventEndDate)) {
      throw new Error('Project participation period has ended');
    }

    const existingParticipation = await db.select()
      .from(projectParticipations)
      .where(eq(projectParticipations.transactionHash, data.transactionHash))
      .limit(1);

    if (existingParticipation.length > 0) {
      throw new Error('Transaction already processed');
    }

    const participantWallet = await mintService.getOrCreateWallet(data.participantWalletAddress);
    const creatorWallet = await mintService.getOrCreateWallet(project.creatorWalletAddress);

    const participantStar = 1;
    const creatorStar = 1;

    await db.transaction(async (tx) => {
      await tx.insert(projectParticipations).values({
        projectId: data.projectId,
        participantWalletId: participantWallet.id,
        participantWalletAddress: data.participantWalletAddress,
        xlmContributed: data.xlmAmount.toString(),
        participantStarEarned: participantStar.toString(),
        creatorStarEarned: creatorStar.toString(),
        transactionHash: data.transactionHash,
      });

      await tx.update(pointBalances)
        .set({
          starPoints: sql`${pointBalances.starPoints} + ${participantStar}`,
          pointsEarnedFromPlatform: sql`${pointBalances.pointsEarnedFromPlatform} + ${participantStar}`,
          updatedAt: new Date(),
        })
        .where(eq(pointBalances.walletId, participantWallet.id));

      await tx.update(pointBalances)
        .set({
          starPoints: sql`${pointBalances.starPoints} + ${creatorStar}`,
          pointsEarnedFromPlatform: sql`${pointBalances.pointsEarnedFromPlatform} + ${creatorStar}`,
          updatedAt: new Date(),
        })
        .where(eq(pointBalances.walletId, creatorWallet.id));

      await tx.update(projects)
        .set({
          totalParticipations: sql`${projects.totalParticipations} + 1`,
          totalXlmContributed: sql`${projects.totalXlmContributed} + ${data.xlmAmount}`,
          totalStarDistributed: sql`${projects.totalStarDistributed} + ${participantStar + creatorStar}`,
          creatorStarEarned: sql`${projects.creatorStarEarned} + ${creatorStar}`,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, data.projectId));
    });

    return {
      participantStar,
      creatorStar,
      totalStar: participantStar + creatorStar,
    };
  }

  async getProjectParticipations(projectId: string) {
    const participations = await db.select()
      .from(projectParticipations)
      .where(eq(projectParticipations.projectId, projectId))
      .orderBy(desc(projectParticipations.createdAt));

    return participations;
  }

  async getUserParticipations(walletAddress: string) {
    const wallet = await mintService.getOrCreateWallet(walletAddress);

    const participations = await db.select({
      participation: projectParticipations,
      project: projects,
    })
      .from(projectParticipations)
      .leftJoin(projects, eq(projectParticipations.projectId, projects.id))
      .where(eq(projectParticipations.participantWalletId, wallet.id))
      .orderBy(desc(projectParticipations.createdAt));

    return participations;
  }

  async finalizeProject(projectId: string, distributorPublicKey: string) {
    const project = await this.getProject(projectId);

    if (project.tokenCreated) {
      throw new Error('Token already created for this project');
    }

    if (new Date() < new Date(project.eventEndDate)) {
      throw new Error('Project event period has not ended yet');
    }

    const tokenResult = await createToken({
      name: project.tokenName,
      symbol: project.tokenSymbol,
      decimals: project.decimals,
      totalSupply: project.totalSupply,
      mintable: true,
      burnable: false,
      distributorPublicKey,
    });

    await db.update(projects)
      .set({
        tokenCreated: true,
        tokenIssuer: tokenResult.issuerPublicKey,
        status: 'completed',
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));

    return {
      ...tokenResult,
      projectInfo: project,
    };
  }
}

export const projectService = new ProjectService();
