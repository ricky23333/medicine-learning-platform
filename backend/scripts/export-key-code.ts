/*
 * 导出系统关键代码到 Word 文档
 * 执行方式: npx ts-node scripts/export-key-code.ts
 */
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, ShadingType } from 'docx';
import * as fs from 'fs';
import * as path from 'path';

// 代码文件配置
const codeFiles = [
  {
    section: '统计模块 - Stats',
    description: '学校统计、成绩导出功能',
    files: [
      {
        path: 'src/modules/stats/stats.service.ts',
        name: 'stats.service.ts',
        description: '统计服务 - 包含学校统计和成绩导出逻辑'
      },
      {
        path: 'src/modules/stats/dto/req-stats.dto.ts',
        name: 'req-stats.dto.ts',
        description: '请求DTO - 查询参数定义'
      },
      {
        path: 'src/modules/stats/dto/res-stats.dto.ts',
        name: 'res-stats.dto.ts',
        description: '响应DTO - Excel导出列配置'
      },
      {
        path: 'src/modules/stats/stats.controller.ts',
        name: 'stats.controller.ts',
        description: '控制器 - API接口定义'
      },
    ]
  },
  {
    section: '用户模块 - SysUser',
    description: '用户管理、专业年级筛选',
    files: [
      {
        path: 'src/modules/sys/sys-user/sys-user.service.ts',
        name: 'sys-user.service.ts',
        description: '用户服务 - 包含按部门获取专业年级方法'
      },
      {
        path: 'src/modules/sys/sys-user/sys-user.controller.ts',
        name: 'sys-user.controller.ts',
        description: '用户控制器 - API接口定义'
      },
    ]
  },
  {
    section: '部门模块 - SysDept',
    description: '部门管理、用户统计',
    files: [
      {
        path: 'src/modules/sys/sys-dept/sys-dept.service.ts',
        name: 'sys-dept.service.ts',
        description: '部门服务 - 包含按部门统计用户数量方法'
      },
    ]
  },
  {
    section: '标本模块 - Specimen',
    description: '图片上传、水印功能',
    files: [
      {
        path: 'src/modules/specimen/specimen.service.ts',
        name: 'specimen.service.ts',
        description: '标本服务 - 图片上传和水印处理逻辑'
      },
    ]
  },
  {
    section: '公共模块 - Excel',
    description: 'Excel导入导出服务',
    files: [
      {
        path: 'src/modules/common/excel/excel.service.ts',
        name: 'excel.service.ts',
        description: 'Excel服务 - 导入导出核心逻辑'
      },
      {
        path: 'src/modules/common/excel/excel.decorator.ts',
        name: 'excel.decorator.ts',
        description: 'Excel装饰器 - 列配置注解'
      },
    ]
  },
];

function createCodeParagraph(code: string): Paragraph[] {
  const lines = code.split('\n');
  return lines.map(line => new Paragraph({
    children: [
      new TextRun({
        text: line || ' ',
        font: 'Consolas',
        size: 16,
      })
    ],
    spacing: { before: 0, after: 0, line: 240 },
  }));
}

function createHeading(text: string, size: number, isBold: boolean = false): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: isBold,
        size: size,
      })
    ],
    spacing: { before: 400, after: 200 },
  });
}

function createDescription(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        italics: true,
        color: '666666',
      })
    ],
    spacing: { before: 100, after: 200 },
  });
}

function createFileHeader(name: string, description: string): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: name, bold: true })] })],
            shading: { type: ShadingType.SOLID, fill: 'E8F4FD' },
            width: { size: 30, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: description })] })],
            shading: { type: ShadingType.SOLID, fill: 'F5F5F5' },
          }),
        ],
      }),
    ],
  });
}

function createPageBreak(): Paragraph {
  return new Paragraph({
    children: [new TextRun({ break: 1 })],
  });
}

async function generateDocument() {
  const children: (Paragraph | Table)[] = [];

  // 标题页
  children.push(new Paragraph({
    children: [new TextRun({ text: 'Medicine Learning Platform', size: 48, bold: true })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 2000, after: 200 },
  }));

  children.push(new Paragraph({
    children: [new TextRun({ text: '后端关键代码文档', size: 36, bold: true })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 400 },
  }));

  children.push(new Paragraph({
    children: [new TextRun({ text: `生成时间: ${new Date().toLocaleString('zh-CN')}`, size: 24 })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 100 },
  }));

  children.push(new Paragraph({
    children: [new TextRun({ text: '项目: medicine-learning-platform-backend', size: 24 })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 100 },
  }));

  children.push(new Paragraph({
    children: [new TextRun({ text: '技术栈: NestJS + Prisma + MySQL + Redis', size: 24 })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 100 },
  }));

  children.push(createPageBreak());

  // 目录
  children.push(createHeading('目录', 32, true));

  codeFiles.forEach((section, idx) => {
    children.push(new Paragraph({
      children: [
        new TextRun({ text: `${idx + 1}. ${section.section}`, bold: true, size: 24 }),
      ],
      spacing: { before: 100, after: 50 },
    }));
    children.push(createDescription(section.description));
  });

  children.push(createPageBreak());

  // 各模块代码
  codeFiles.forEach((section, sectionIdx) => {
    children.push(createHeading(`${sectionIdx + 1}. ${section.section}`, 28, true));
    children.push(createDescription(section.description));

    section.files.forEach(file => {
      const filePath = path.join(process.cwd(), file.path);

      if (fs.existsSync(filePath)) {
        const code = fs.readFileSync(filePath, 'utf-8');

        children.push(createHeading(file.name, 24, true));
        children.push(createFileHeader(file.path, file.description));
        children.push(new Paragraph({ spacing: { before: 100, after: 0 } }));

        // 代码内容
        children.push(...createCodeParagraph(code));

        children.push(createPageBreak());
      } else {
        children.push(new Paragraph({
          children: [new TextRun({ text: `文件不存在: ${file.path}`, color: 'FF0000' })],
        }));
      }
    });
  });

  // 创建文档
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440,
          },
        },
      },
      children,
    }],
  });

  // 保存文档
  const outputPath = path.join(process.cwd(), '关键代码文档.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);

  console.log(`文档已生成: ${outputPath}`);
}

generateDocument().catch(console.error);
