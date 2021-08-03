import * as React from 'react';
import { useInjectable } from '@ali/ide-core-browser';
import { ViewState } from '@ali/ide-core-browser';
import { IStatusBarService } from '@ali/ide-status-bar';
import clx from 'classnames';
import { Badge } from '@ali/ide-components';
import { StatusBarItem } from '@ali/ide-status-bar/lib/browser/status-bar-item.view';
import { ICtxMenuRenderer, MenuId, AbstractContextMenuService } from '@ali/ide-core-browser/lib/menu/next';

import { ISCMRepository } from '../../common';
import { getSCMRepositoryDesc } from '../scm-util';

import * as styles from './scm-provider-list.module.less';

const SCMProvider: React.FC<{
  repository: ISCMRepository;
  selected?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onContextMenu?: React.MouseEventHandler<HTMLDivElement>;
  style?: React.CSSProperties;
}> = ({ repository, selected, ...restProps }) => {
  const { provider } = repository;
  const { title, type } = getSCMRepositoryDesc(repository);

  const statusBarService = useInjectable(IStatusBarService);

  const statusConfig = (provider.statusBarCommands || [])
    .map((c, index) => {
      return statusBarService.getElementConfig(`scm.repo.${index}`, {
        text: c.title,
        command: c.id,
        arguments: c.arguments,
        tooltip: c.tooltip,
        iconset: 'octicon',
      });
    });

  return (
    <div className={clx(styles.provider, { [styles.selected]: selected })} {...restProps}>
      <div className={styles.info}>
        <div className={styles.title}>{title}&nbsp;</div>
        <div className={styles.type}>{type}&nbsp;</div>
        {
          provider.count && provider.count > 0
            ? <Badge>{provider.count}</Badge>
            : null
        }
      </div>
      <div className={styles.toolbar}>
        {
          statusConfig.map((config) => (
            <StatusBarItem
              key={config.id}
              className={styles.status}
              {...config} />
          ))
        }
      </div>
    </div>
  );
};

export const SCMProviderList: React.FC<{
  repositoryList: ISCMRepository[];
  selectedRepository?: ISCMRepository;
  viewState: ViewState;
}> = function SCMRepoSelect({ repositoryList, selectedRepository }) {
  if (!selectedRepository) {
    return null;
  }

  const ctxMenuRenderer = useInjectable<ICtxMenuRenderer>(ICtxMenuRenderer);
  const ctxmenuService = useInjectable<AbstractContextMenuService>(AbstractContextMenuService);

  const handleRepositorySelect = React.useCallback((selectedRepo: ISCMRepository) => {
    selectedRepo.setSelected(true);
    selectedRepo.focus();
  }, []);

  const handleProviderCtxMenu = React.useCallback((selectedRepo: ISCMRepository, e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = e.nativeEvent;

    const menus = ctxmenuService.createMenu({ id: MenuId.SCMSourceControl });
    const menuNodes = menus.getMergedMenuNodes();
    menus.dispose();

    ctxMenuRenderer.show({
      anchor: { x, y },
      menuNodes,
      args: [ selectedRepo.provider.toJSON() ],
    });
  }, []);

  return (
    <div className={styles.scmSelect}>
      {
        repositoryList.map((currentRepo) => {
          return (
            <SCMProvider
              key={currentRepo.provider.id}
              selected={currentRepo.provider.id === selectedRepository.provider.id}
              onClick={handleRepositorySelect.bind(null, currentRepo)}
              onContextMenu={handleProviderCtxMenu.bind(null, currentRepo)}
              repository={currentRepo} />
          );
        })
      }
    </div>
  );
};

SCMProviderList.displayName = 'SCMProviderList';