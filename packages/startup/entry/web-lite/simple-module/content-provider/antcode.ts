import { IEditorDocumentModelContentProvider } from '@ali/ide-editor/lib/browser';
import { URI } from '@ali/ide-core-common';
// import * as md5 from 'md5';

import { fromSCMUri } from '../../modules/uri';
import { AbstractSCMDocContentProvider } from '../../modules/scm-doc-provider';

export class AntcodeDocContentProvider extends AbstractSCMDocContentProvider implements IEditorDocumentModelContentProvider {
  static base64ToUnicode(str: string) {
    return decodeURIComponent(
      atob(str)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''),
      );
  }

  // TODO: 需要增加对文件变更后的监听，以保持文件内容最新

  scheme = 'antcode';

  async fetchContentFromSCM(uri: URI) {
    const info = fromSCMUri(uri);
    return await fetch(
      `/code-service/v4/projects/${encodeURIComponent(info.repo)}/repository/files/${encodeURIComponent(info.path.slice(1))}?ref=${info.ref}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
      .then((res) => res.json())
      .then((ret) => {
        if (ret.encoding === 'base64') {
          ret.content = AntcodeDocContentProvider.base64ToUnicode(ret.content);
        }
        return ret.content;
      });
  }
}