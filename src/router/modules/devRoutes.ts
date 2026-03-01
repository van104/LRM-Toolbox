import type { RouteRecordRaw } from 'vue-router';

/** 开发工具路由 */
const devRoutes: RouteRecordRaw[] = [
  {
    path: '/tools/json-formatter',
    name: 'JsonFormatter',
    component: () => import('@/components/tools/dev/JsonFormatter.vue')
  },
  {
    path: '/tools/base64',
    name: 'Base64Tool',
    component: () => import('@/components/tools/dev/Base64Tool.vue')
  },
  {
    path: '/tools/timestamp',
    name: 'TimestampTool',
    component: () => import('@/components/tools/dev/TimestampTool.vue')
  },
  {
    path: '/tools/md5',
    name: 'Md5Tool',
    component: () => import('@/components/tools/dev/Md5Tool.vue')
  },
  {
    path: '/tools/regex',
    name: 'RegexTool',
    component: () => import('@/components/tools/dev/RegexTool.vue')
  },
  {
    path: '/tools/url',
    name: 'UrlTool',
    component: () => import('@/components/tools/dev/UrlTool.vue')
  },
  {
    path: '/tools/css-formatter',
    name: 'CssFormatterTool',
    component: () => import('@/components/tools/dev/CssFormatterTool.vue')
  },
  {
    path: '/tools/password-generator',
    name: 'PasswordGenerator',
    component: () => import('@/components/tools/dev/PasswordGenerator.vue')
  },
  {
    path: '/tools/string-escaper',
    name: 'StringEscaperTool',
    component: () => import('@/components/tools/dev/StringEscaperTool.vue')
  },
  {
    path: '/tools/sql-builder',
    name: 'SqlBuilderTool',
    component: () => import('@/components/tools/dev/SqlBuilderTool.vue')
  },
  {
    path: '/tools/api-tester',
    name: 'ApiTesterTool',
    component: () => import('@/components/tools/dev/ApiTesterTool.vue')
  },
  {
    path: '/tools/jwt-decoder',
    name: 'JwtDecoderTool',
    component: () => import('@/components/tools/dev/JwtDecoderTool.vue')
  },
  {
    path: '/tools/crontab',
    name: 'CrontabTool',
    component: () => import('@/components/tools/dev/CrontabTool.vue')
  },
  {
    path: '/tools/git-cheatsheet',
    name: 'GitCheatSheetTool',
    component: () => import('@/components/tools/dev/GitCheatSheetTool.vue')
  },
  {
    path: '/tools/ssl-checker',
    name: 'SslCheckerTool',
    component: () => import('@/components/tools/dev/SslCheckerTool.vue')
  },
  {
    path: '/tools/config-templates',
    name: 'ConfigTemplatesTool',
    component: () => import('@/components/tools/dev/ConfigTemplatesTool.vue')
  },
  {
    path: '/tools/port-check',
    name: 'PortTool',
    component: () => import('@/components/tools/dev/PortTool.vue')
  },
  {
    path: '/tools/random-data',
    name: 'RandomDataTool',
    component: () => import('@/components/tools/dev/RandomDataTool.vue')
  },
  {
    path: '/tools/user-agent',
    name: 'UserAgentParserTool',
    component: () => import('@/components/tools/dev/UserAgentParserTool.vue')
  },
  {
    path: '/tools/encoding',
    name: 'EncodingTool',
    component: () => import('@/components/tools/dev/EncodingTool.vue')
  },
  {
    path: '/tools/cheat-sheet',
    name: 'CheatSheetTool',
    component: () => import('@/components/tools/dev/CheatSheetTool.vue')
  },
  {
    path: '/tools/my-network',
    name: 'MyNetworkInfoTool',
    component: () => import('@/components/tools/dev/MyNetworkInfoTool.vue')
  },
  {
    path: '/tools/html-entity',
    name: 'HtmlEntityTool',
    component: () => import('@/components/tools/dev/HtmlEntityTool.vue')
  },
  {
    path: '/tools/ip-location',
    name: 'IpLocationTool',
    component: () => import('@/components/tools/dev/IpLocationTool.vue')
  },
  {
    path: '/tools/base-converter',
    name: 'BaseConverterTool',
    component: () => import('@/components/tools/dev/BaseConverterTool.vue')
  },
  {
    path: '/tools/xml-formatter',
    name: 'XmlFormatterTool',
    component: () => import('@/components/tools/dev/XmlFormatterTool.vue')
  },
  {
    path: '/tools/yaml-converter',
    name: 'YamlConverterTool',
    component: () => import('@/components/tools/dev/YamlConverterTool.vue')
  },
  {
    path: '/tools/subnet-calculator',
    name: 'SubnetCalculator',
    component: () => import('@/components/tools/dev/SubnetCalculatorTool.vue')
  },
  {
    path: '/tools/ua-parser',
    name: 'UserAgentParser',
    component: () => import('@/components/tools/dev/UserAgentParserTool.vue')
  },
  {
    path: '/tools/network-info',
    name: 'MyNetworkInfo',
    component: () => import('@/components/tools/dev/MyNetworkInfoTool.vue')
  },
  {
    path: '/tools/uuid-generator',
    name: 'UuidGenerator',
    component: () => import('@/components/tools/dev/UuidGeneratorTool.vue')
  },
  {
    path: '/tools/chmod-calculator',
    name: 'ChmodCalculator',
    component: () => import('@/components/tools/dev/ChmodCalculatorTool.vue')
  },
  {
    path: '/tools/meta-tag-generator',
    name: 'MetaTagGenerator',
    component: () => import('@/components/tools/dev/MetaTagGeneratorTool.vue')
  },
  {
    path: '/tools/http-status-codes',
    name: 'HttpStatusCodes',
    component: () => import('@/components/tools/dev/HttpStatusCodesTool.vue')
  },
  {
    path: '/tools/curl-builder',
    name: 'CurlBuilder',
    component: () => import('@/components/tools/dev/CurlBuilderTool.vue')
  },
  {
    path: '/tools/robots-generator',
    name: 'RobotsGenerator',
    component: () => import('@/components/tools/dev/RobotsGeneratorTool.vue')
  },
  {
    path: '/tools/dockerfile-generator',
    name: 'DockerfileGenerator',
    component: () => import('@/components/tools/dev/DockerfileGeneratorTool.vue')
  },
  {
    path: '/tools/code-screenshot',
    name: 'CodeScreenshotTool',
    component: () => import('@/components/tools/dev/CodeScreenshotTool.vue')
  },
  {
    path: '/tools/regex-viz',
    name: 'RegexVizTool',
    component: () => import('@/components/tools/dev/RegexVizTool.vue')
  },
  {
    path: '/tools/perf-checklist',
    name: 'PerfChecklistTool',
    component: () => import('@/components/tools/dev/PerfChecklistTool.vue')
  },
  {
    path: '/tools/env-editor',
    name: 'EnvEditorTool',
    component: () => import('@/components/tools/dev/EnvEditorTool.vue')
  },
  {
    path: '/tools/js-obfuscator',
    name: 'JSObfuscatorTool',
    component: () => import('@/components/tools/dev/JSObfuscatorTool.vue')
  }
];

export default devRoutes;
