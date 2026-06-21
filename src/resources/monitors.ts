import { APIResource } from './_base';
import { autoPaginate } from '../pagination';
import type { RequestOptions } from '../client';
import type {
  ScoutResponse,
  MonitorCreateParams,
  MonitorUpdateParams,
  SearchListParams,
} from '../types';

/**
 * Scheduled searches ("monitors"): run a query on a cadence and receive new
 * results via webhook.
 */
export class Monitors extends APIResource {
  /** Create a monitor with a `query` and a `cadence` or `cron` schedule. */
  create(params: MonitorCreateParams, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/monitors',
      body: params,
      options,
    });
  }

  /** List monitors. */
  list(params: SearchListParams = {}, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'GET',
      path: '/v1/monitors',
      query: params,
      options,
    });
  }

  /** Auto-paginating iterator over all monitors. */
  iterate(params: SearchListParams = {}, options?: RequestOptions) {
    return autoPaginate<ScoutResponse>(
      (limit, offset) => this.list({ ...params, limit, offset }, options),
      params,
    );
  }

  /** Fetch a monitor by id. */
  get(monitorId: string, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'GET',
      path: `/v1/monitors/${encodeURIComponent(monitorId)}`,
      options,
    });
  }

  /** Update a monitor's query, schedule, or webhook. */
  update(
    monitorId: string,
    params: MonitorUpdateParams,
    options?: RequestOptions,
  ): Promise<ScoutResponse> {
    return this.client.request({
      method: 'PATCH',
      path: `/v1/monitors/${encodeURIComponent(monitorId)}`,
      body: params,
      options,
    });
  }

  /** Delete a monitor. */
  del(monitorId: string, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'DELETE',
      path: `/v1/monitors/${encodeURIComponent(monitorId)}`,
      options,
    });
  }

  /** Pause a monitor. */
  pause(monitorId: string, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: `/v1/monitors/${encodeURIComponent(monitorId)}/pause`,
      options,
    });
  }

  /** Resume a paused monitor. */
  resume(monitorId: string, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: `/v1/monitors/${encodeURIComponent(monitorId)}/resume`,
      options,
    });
  }

  /** Trigger a monitor run immediately. */
  run(monitorId: string, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: `/v1/monitors/${encodeURIComponent(monitorId)}/run`,
      options,
    });
  }

  /** Fetch a monitor's events. */
  events(monitorId: string, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'GET',
      path: `/v1/monitors/${encodeURIComponent(monitorId)}/events`,
      options,
    });
  }
}
