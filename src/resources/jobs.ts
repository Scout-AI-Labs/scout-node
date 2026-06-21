import { APIResource } from './_base.js';
import { autoPaginate } from '../pagination.js';
import type { RequestOptions } from '../client.js';
import type { ScoutResponse, JobCreateParams, SearchListParams } from '../types.js';

/**
 * Async tasks ("jobs"): submit a natural-language task, then poll the task or
 * stream its events until it completes.
 */
export class Jobs extends APIResource {
  /** Submit a job. Returns a task id to poll with `get(taskId)`. */
  create(params: JobCreateParams, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/jobs',
      body: params,
      options,
    });
  }

  /** List jobs (most recent first). */
  list(params: SearchListParams = {}, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'GET',
      path: '/v1/jobs',
      query: params,
      options,
    });
  }

  /** Auto-paginating iterator over all jobs. */
  iterate(params: SearchListParams = {}, options?: RequestOptions) {
    return autoPaginate<ScoutResponse>(
      (limit, offset) => this.list({ ...params, limit, offset }, options),
      params,
    );
  }

  /** Fetch a job by task id. */
  get(taskId: string, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'GET',
      path: `/v1/jobs/${encodeURIComponent(taskId)}`,
      options,
    });
  }

  /** Cancel a running job. */
  cancel(taskId: string, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: `/v1/jobs/${encodeURIComponent(taskId)}/cancel`,
      options,
    });
  }

  /** Fetch a job's events. */
  events(taskId: string, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'GET',
      path: `/v1/jobs/${encodeURIComponent(taskId)}/events`,
      options,
    });
  }

  /** Fetch the result of a completed run. */
  runResult(runId: string, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'GET',
      path: `/v1/jobs/runs/${encodeURIComponent(runId)}`,
      options,
    });
  }

  /** Start a run for a job. */
  startRun(body: Record<string, unknown> = {}, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/jobs/runs',
      body,
      options,
    });
  }

  /** Fetch a run's events. */
  runEvents(runId: string, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'GET',
      path: `/v1/jobs/runs/${encodeURIComponent(runId)}/events`,
      options,
    });
  }
}
