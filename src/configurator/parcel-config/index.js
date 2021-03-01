import _ from 'lodash';

import {
  css,
  scss,
  less,
  stylus,
  postCssConfig,
  tailwindcss,
} from '../../templates/styling';
import {
  reactIndexJs,
  reactAppJs,
  reactIndexTsx,
  reactAppTsx,
} from '../../templates/react/index';
import { indexHtml } from '../../templates/base';
import { emptyIndexJs } from '../../templates/empty/index';
import { tsconfig, tsconfigReact } from '../../templates/ts';
import { vueIndexAppVue, vueIndexTs, vueShimType } from '../../templates/vue';

import lintingRules from '../common-config/linting';
import unitTestsRules from '../common-config/unitTests';

function getStyleImports(configItems) {
  const isCss = _.includes(configItems, 'CSS');
  const isSass = _.includes(configItems, 'Sass');
  const isLess = _.includes(configItems, 'Less');
  const isStylus = _.includes(configItems, 'stylus');
  return _.concat(
    [],
    isCss ? [`import "./styles.css";`] : [],
    isSass ? [`import "./styles.scss";`] : [],
    isLess ? [`import "./styles.less";`] : [],
    isStylus ? [`import "./styles.styl";`] : []
  );
}
export default (() => {
  const features = {
    'No library': {
      group: 'Main library',
    },
    React: {
      group: 'Main library',
      dependencies: configItems => ['react', 'react-dom'],
      devDependencies: configItems => {
        const isTypescript = _.includes(configItems, 'Typescript');
        return _.concat(
          [],
          isTypescript ? ['@types/react', '@types/react-dom'] : []
        );
      },
      files: configItems => {
        const isTypescript = _.includes(configItems, 'Typescript');
        const extraImports = getStyleImports(configItems);

        if (isTypescript) {
          return {
            'src/index.tsx': reactIndexTsx(extraImports),
            'src/App.tsx': reactAppTsx(configItems),
            'src/index.html': indexHtml({ bundleFilename: 'index.tsx' }),
          };
        }

        return {
          'src/index.js': reactIndexJs(extraImports),
          'src/App.js': reactAppJs(configItems),
          'src/index.html': indexHtml({ bundleFilename: 'index.js' }),
        };
      },
    },
    Vue: {
      group: 'Main library',
      dependencies: configItems => ['vue'],
      files: configItems => {
        const isTypescript = _.includes(configItems, 'Typescript');
        const indexExtension = isTypescript ? 'ts' : 'js';
        const isCss = _.includes(configItems, 'CSS');
        const isLess = _.includes(configItems, 'Less');
        const isSass = _.includes(configItems, 'Sass');
        const isStylus = _.includes(configItems, 'stylus');
        const isTailwindCSS = _.includes(configItems, 'Tailwind CSS');
        const cssStyle = `<style>
${css}
</style>`;
        const lessStyle = `<style lang="less">
${less}
</style>`;
        const sassStyle = `<style lang="scss">
${scss}
</style>`;
        const stylusStyle = `<style lang="styl">
${stylus}
</style>`;
        const tailwindcssStyle = `<style global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>`;
        const styling = _.concat(
          [],
          isCss && !isTailwindCSS ? cssStyle : [],
          isSass ? sassStyle : [],
          isLess ? lessStyle : [],
          isStylus ? stylusStyle : [],
          isTailwindCSS ? tailwindcssStyle : []
        );

        return _.assign(
          {
            'src/App.vue': vueIndexAppVue(_.join(styling, '\n'), configItems),
            'src/index.html': indexHtml({
              bundleFilename: `index.${indexExtension}`,
            }),
            [`src/index.${indexExtension}`]: vueIndexTs(),
          },
          isTypescript ? { 'vue-shim.d.ts': vueShimType } : {}
        );
      },
    },
    Bootstrap: {
      group: 'UI library',
      dependencies: configItems => ['bootstrap', 'jquery', 'popper.js'],
    },
    'Tailwind CSS': {
      group: 'UI library',
      dependencies: configItems => ['tailwindcss'],
    },
    'Material-UI': {
      group: 'UI library',
      dependencies: configItems => [
        '@material-ui/core',
        'fontsource-roboto',
        '@material-ui/icons',
      ],
    },
    Jest: unitTestsRules.Jest,
    Mocha: unitTestsRules.Mocha,
    Chai: unitTestsRules.Chai,
    Jasmine: unitTestsRules.Jasmine,
    AVA: unitTestsRules.AVA,
    Cypress: unitTestsRules.Cypress,
    TestCafe: unitTestsRules.TestCafe,
    Babel: {
      group: 'Transpiler',
      babel: (babelConfig, configItems) => ({
        ...babelConfig,
        presets: _.concat(
          [['@babel/preset-env', { modules: false }]],
          _.includes(configItems, 'React') ? '@babel/preset-react' : []
        ),
      }),
      devDependencies: configItems =>
        _.concat(
          ['@babel/core', '@babel/preset-env'],
          _.includes(configItems, 'React') ? '@babel/preset-react' : []
        ),
    },
    Typescript: {
      group: 'Transpiler',
      files: configItems => {
        const isReact = _.includes(configItems, 'React');
        const isVue = _.includes(configItems, 'Vue');

        const configFiles = isReact
          ? { 'tsconfig.json': tsconfigReact }
          : { 'tsconfig.json': tsconfig };
        const sourceFiles =
          !isReact && !isVue
            ? {
                'src/index.html': indexHtml({ bundleFilename: 'index.ts' }),
                'src/index.ts': emptyIndexJs(),
              }
            : {};
        return _.assign(configFiles, sourceFiles);
      },
    },
    CSS: {
      group: 'Styling',
      files: configItems => {
        const isTailwindcss = _.includes(configItems, 'Tailwind CSS');
        return {
          'src/styles.css': isTailwindcss
            ? tailwindcss({ withPostCSS: true })
            : css,
        };
      },
    },
    PostCSS: {
      group: 'Styling',
      devDependencies: configItems => ['postcss-modules', 'autoprefixer'],
      files: configItems => {
        const isTailwindcss = _.includes(configItems, 'Tailwind CSS');
        return { 'postcss.config.js': postCssConfig(isTailwindcss) };
      },
    },
    Sass: {
      group: 'Styling',
      // devDependencies: configItems => ['sass'],//ToDO is thiss needed?
      files: configItems => ({ 'src/styles.scss': scss }),
    },
    Less: {
      group: 'Styling',
      files: configItems => ({ 'src/styles.less': less }),
    },
    stylus: {
      group: 'Styling',
      files: configItems => ({ 'src/styles.styl': stylus }),
    },
    ESLint: lintingRules.eslint,
    Prettier: lintingRules.prettier,
    'react-hot-toast':{
      group: 'React',
      dependencies: configItems => ['react-hot-toast'],
    },
    'React Router':{
      group:'React',
      dependencies: configItems => ['react-router'],
    },
  };
  const featuresNoNulls = _.mapValues(features, item => {
    if (!item.babel) {
      item.babel = _.identity;
    }
    if (!item.dependencies) {
      item.dependencies = () => [];
    }
    if (!item.devDependencies) {
      item.devDependencies = () => [];
    }
    if (!item.packageJson) {
      item.packageJson = {};
    }
    if (!item.files) {
      item.files = () => {};
    }

    return item;
  });
  return {
    features: featuresNoNulls,
    base: {
      packageJson: {
        scripts: {
          start: 'parcel src/index.html',
          'build-prod': 'parcel build src/index.html',
        },
      },
      devDependencies: ['parcel-bundler'],
      files: configItems => {
        const isReact = _.includes(configItems, 'React');
        const isTypescript = _.includes(configItems, 'Typescript');
        const isVue = _.includes(configItems, 'Vue');
        if (!isReact && !isTypescript && !isVue) {
          return {
            'src/index.js': emptyIndexJs(getStyleImports(configItems)),
            'src/index.html': indexHtml({ bundleFilename: 'index.js' }),
          };
        }
        return [];
      },
    },
  };
})();
